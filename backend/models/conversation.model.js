const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  userId: String,
  productId: String,
  productName: String,
  assignedAdminId: { type: String, default: null }, // Admin đang phụ trách
  status: { type: String, default: "active" },
  userFullname: { type: String, default: "" },
  productImage: { type: String, default: "" },
  messages: [
    {
      sender: String, // 'user', 'bot', 'admin'
      text: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  lastUpdated: { type: Date, default: Date.now },
});
const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;
