const Conversation = require("../models/conversation.model");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { default: mongoose } = require("mongoose");
require("dotenv").config();

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_ID = process.env.GEMINI_MODEL || "gemini-1.5-flash";

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_ID });

let onlineAdmins = new Map();

function findBestAdmin() {
  let bestAdmin = null;
  let minLoad = Infinity;
  for (const [adminId, data] of onlineAdmins) {
    if (data.activeChats < minLoad) {
      minLoad = data.activeChats;
      bestAdmin = adminId;
    }
  }
  return bestAdmin;
}

async function handleAIResponse(io, conv, userText, price, desc, adminId) {
  try {
    const prompt = `
            Bạn là nhân viên shop nông sản. Khách đang xem: ${conv.productName}.
            Giá: ${price}. Mô tả: ${desc}.
            Khách hỏi: "${userText}".
            Trả lời ngắn gọn, thân thiện (phải dưới 40 từ).
        `;

    const result = await model.generateContent(prompt);
    const aiText = result.response.text();

    await saveAndSendBotMessage(io, conv, aiText, adminId);
  } catch (e) {
    console.error("AI ERROR:", e.message);
    let fallbackMessage =
      "Xin lỗi, mạng hơi yếu. Bạn chờ nhân viên tư vấn xíu nhé.";

    if (e.message.includes("429")) {
      fallbackMessage = "Hệ thống đang quá tải, bạn vui lòng chờ giây lát nhé!";
    }

    await saveAndSendBotMessage(io, conv, fallbackMessage, adminId);
  }
}

async function saveAndSendBotMessage(io, conv, text, adminId) {
  const botMsg = { sender: "bot", text: text, timestamp: new Date() };

  await Conversation.findByIdAndUpdate(conv._id, {
    $push: { messages: botMsg },
    $set: { lastUpdated: new Date() },
  });

  io.emit(`msg_client_${conv.userId}`, botMsg);

  if (adminId && onlineAdmins.has(adminId)) {
    io.to(onlineAdmins.get(adminId).socketId).emit("admin_receive_message", {
      userId: conv.userId,
      productName: conv.productName,
      ...botMsg,
      isAssignedToYou: true,
    });
  }
}

async function fetchExtraInfo(userId, productId) {
  let info = { userFullname: "Khách vãng lai", productImage: "" };
  try {
    if (mongoose.models.AgriProduct) {
      const product = await mongoose
        .model("AgriProduct")
        .findById(productId)
        .select("images");
      if (product?.images?.length > 0) info.productImage = product.images[0];
    }
    if (mongoose.Types.ObjectId.isValid(userId) && mongoose.models.User) {
      const user = await mongoose
        .model("User")
        .findById(userId)
        .select("fullname");
      if (user) info.userFullname = user.fullname;
    }
  } catch (e) {
    console.error("Lỗi lấy thông tin phụ:", e.message);
  }
  return info;
}

exports.sendClientMessage = async (req, res) => {
  const { userId, productId, productName, text, productPrice, productDesc } =
    req.body;
  const io = req.io;

  try {
    let conv = await Conversation.findOne({ userId, productId });
    let assignedAdminId = conv?.assignedAdminId;
    let isReassigned = false;

    if (!assignedAdminId || !onlineAdmins.has(assignedAdminId)) {
      const bestAdmin = findBestAdmin();
      if (bestAdmin) {
        assignedAdminId = bestAdmin;
        onlineAdmins.get(bestAdmin).activeChats += 1;
        isReassigned = true;
      }
    }

    const userMsg = { sender: "user", text, timestamp: new Date() };

    if (!conv) {
      const extraInfo = await fetchExtraInfo(userId, productId);
      conv = new Conversation({
        userId,
        productId,
        productName,
        userFullname: extraInfo.userFullname,
        productImage: extraInfo.productImage,
        assignedAdminId,
        messages: [userMsg],
      });
    } else {
      conv.messages.push(userMsg);
      conv.lastUpdated = new Date();
      if (assignedAdminId) conv.assignedAdminId = assignedAdminId;
    }

    await conv.save();
    io.emit(`msg_client_${userId}`, userMsg);

    // Thông báo cho Admin
    if (assignedAdminId && onlineAdmins.has(assignedAdminId)) {
      const adminSocket = onlineAdmins.get(assignedAdminId).socketId;
      io.to(adminSocket).emit("admin_receive_message", {
        userId,
        productName,
        userFullname: conv.userFullname,
        productImage: conv.productImage,
        ...userMsg,
        isAssignedToYou: true,
      });

      if (isReassigned) {
        io.to(adminSocket).emit("notification", {
          type: "alert",
          message: `Khách mới: ${conv.userFullname}`,
        });
        io.to(adminSocket).emit("refresh_list");
      }
    }

    res.json({ success: true });

    // Gọi AI phản hồi sau khi res thành công
    handleAIResponse(
      io,
      conv,
      text,
      productPrice,
      productDesc,
      assignedAdminId
    );
  } catch (e) {
    res.status(500).json({ error: "Lỗi server" });
  }
};

exports.sendAdminReply = async (req, res) => {
  const { adminId, targetUserId, productId, text } = req.body;
  const io = req.io;
  try {
    const adminMsg = { sender: "admin", text, timestamp: new Date() };
    await Conversation.updateOne(
      { userId: targetUserId, productId },
      { $push: { messages: adminMsg }, $set: { lastUpdated: new Date() } }
    );
    io.emit(`msg_client_${targetUserId}`, adminMsg);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { userId, productId } = req.query;
    const conv = await Conversation.findOne({ userId, productId });
    res.json(conv ? conv.messages : []);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.handleAdminLogin = async (socket, adminId) => {
  const count = await Conversation.countDocuments({
    assignedAdminId: adminId,
    status: "active",
  });
  onlineAdmins.set(adminId, { socketId: socket.id, activeChats: count });
  socket.join("admin_room");
  console.log(`Admin ${adminId} online (Load: ${count})`);
};

exports.handleDisconnect = async (socket, io) => {
  let disconnectedAdmin = null;
  for (const [id, data] of onlineAdmins) {
    if (data.socketId === socket.id) {
      disconnectedAdmin = id;
      break;
    }
  }

  if (disconnectedAdmin) {
    onlineAdmins.delete(disconnectedAdmin);
    const orphanedChats = await Conversation.find({
      assignedAdminId: disconnectedAdmin,
      status: "active",
    });
    if (orphanedChats.length > 0) {
      const backupAdminId = findBestAdmin();
      if (backupAdminId) {
        await Conversation.updateMany(
          { assignedAdminId: disconnectedAdmin, status: "active" },
          { $set: { assignedAdminId: backupAdminId } }
        );
        onlineAdmins.get(backupAdminId).activeChats += orphanedChats.length;
        io.to(onlineAdmins.get(backupAdminId).socketId).emit("refresh_list");
      }
    }
  }
};
