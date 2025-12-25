import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import io from "socket.io-client";
import { useSelector } from "react-redux";
import API from "../../api";

const Chat = () => {
  const user = useSelector((state) => state.user);
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [reply, setReply] = useState("");
  const [notification, setNotification] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  const sortChatsHelper = useCallback(
    (chatList) => {
      return [...chatList].sort((a, b) => {
        const isMineA = a.assignedAdminId === user.id;
        const isMineB = b.assignedAdminId === user.id;
        if (isMineA && !isMineB) return -1;
        if (!isMineA && isMineB) return 1;
        return new Date(b.lastUpdated) - new Date(a.lastUpdated);
      });
    },
    [user.id]
  );

  const fetchChats = async () => {
    try {
      const { data } = await API.get("/admin/my-chats");
      setChats(sortChatsHelper(data));
    } catch (e) {
      console.error(e);
    }
  };

  const playNotificationSound = () => {
    if (!isMuted) {
      new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.m4a"
      )
        .play()
        .catch(() => {});
    }
  };

  useEffect(() => {
    if (user.id && user.isAdmin) {
      fetchChats();
      socketRef.current = io("http://localhost:5000", {
        transports: ["websocket", "polling"],
      });
      socketRef.current.emit("admin_login", user.id);

      socketRef.current.on("admin_receive_message", (newMsgData) => {
        setChats((prevChats) => {
          let updatedChats = [...prevChats];
          const existingIndex = updatedChats.findIndex(
            (c) => c.userId === newMsgData.userId
          );

          if (existingIndex > -1) {
            const chatToUpdate = { ...updatedChats[existingIndex] };
            chatToUpdate.messages.push({
              sender: newMsgData.sender,
              text: newMsgData.text,
              timestamp: new Date(),
            });
            chatToUpdate.lastUpdated = new Date();

            if (newMsgData.assignedAdminId)
              chatToUpdate.assignedAdminId = newMsgData.assignedAdminId;
            if (newMsgData.productImage)
              chatToUpdate.productImage = newMsgData.productImage;
            if (newMsgData.userFullname)
              chatToUpdate.userFullname = newMsgData.userFullname;

            updatedChats.splice(existingIndex, 1);
            updatedChats.unshift(chatToUpdate);
          } else {
            const newChatSession = {
              _id: Date.now(),
              userId: newMsgData.userId,
              productId: newMsgData.productId,
              productName: newMsgData.productName,
              userFullname: newMsgData.userFullname || "Khách mới",
              productImage: newMsgData.productImage || "",
              assignedAdminId: newMsgData.assignedAdminId,
              lastUpdated: new Date(),
              messages: [
                {
                  sender: newMsgData.sender,
                  text: newMsgData.text,
                  timestamp: new Date(),
                },
              ],
            };
            updatedChats.push(newChatSession);
          }
          return sortChatsHelper(updatedChats);
        });

        if (newMsgData.sender !== "admin") playNotificationSound();
      });

      socketRef.current.on("refresh_list", fetchChats);
      socketRef.current.on("notification", (noti) => {
        setNotification(noti);
        if (noti.type === "alert") playNotificationSound();
        setTimeout(() => setNotification(null), 5000);
      });

      return () => socketRef.current.disconnect();
    }
  }, [user.id, user.isAdmin, sortChatsHelper]);

  const activeConversation = useMemo(
    () => chats.find((c) => c.userId === selectedChatId),
    [chats, selectedChatId]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages]);

  const handleReply = async () => {
    if (!reply.trim() || !activeConversation) return;
    try {
      await API.post("/admin/reply", {
        adminId: user.id,
        targetUserId: activeConversation.userId,
        productId: activeConversation.productId,
        text: reply,
      });
      setReply("");
    } catch (e) {
      alert("Lỗi gửi tin nhắn");
    }
  };

  if (!user.isAdmin)
    return (
      <div className="p-10 text-center text-red-500">
        Bạn không có quyền truy cập.
      </div>
    );

  return (
    <div
      style={{
        display: "flex",
        height: "88vh",
        fontFamily: "Segoe UI, sans-serif",
        border: "1px solid #e5e7eb",
        background: "#fff",
      }}
    >
      <div
        style={{
          width: 350,
          borderRight: "1px solid #e5e7eb",
          background: "#f8f9fa",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "16px",
            background: "#fff",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: "bold",
                color: "#333",
              }}
            >
              {user.fullname || "Admin"}
            </h3>
            <span style={{ fontSize: 12, color: "#10b981" }}>
              ● Đang trực tuyến
            </span>
          </div>
          <button
            onClick={() => setIsMuted(!isMuted)}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
        </div>

        {notification && (
          <div
            style={{
              padding: 10,
              background: "#fff3cd",
              color: "#856404",
              fontSize: 13,
              borderBottom: "1px solid #ffeeba",
            }}
          >
            ⚠️ {notification.message}
          </div>
        )}

        <div style={{ overflowY: "auto", flex: 1 }}>
          {chats.map((chat) => {
            const isMine = chat.assignedAdminId === user.id;
            return (
              <div
                key={chat._id}
                onClick={() => setSelectedChatId(chat.userId)}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #f0f0f0",
                  cursor: "pointer",
                  background:
                    selectedChatId === chat.userId
                      ? "#e6f7ff"
                      : isMine
                      ? "#fff"
                      : "#fafafa",
                  borderLeft:
                    selectedChatId === chat.userId
                      ? "4px solid #1890ff"
                      : isMine
                      ? "4px solid #52c41a"
                      : "4px solid transparent",
                  display: "flex",
                  gap: "12px",
                  opacity: isMine ? 1 : 0.8,
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: 48,
                    height: 48,
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={
                      chat.productImage ||
                      "https://via.placeholder.com/48?text=Product"
                    }
                    alt="Product"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  {isMine && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: -2,
                        right: -2,
                        width: 12,
                        height: 12,
                        background: "#52c41a",
                        borderRadius: "50%",
                        border: "2px solid #fff",
                      }}
                    ></div>
                  )}
                </div>

                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: 2,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "600",
                        fontSize: 14,
                        color: "#262626",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {chat.userFullname}
                    </span>
                    <span
                      style={{ fontSize: 11, color: "#8c8c8c", flexShrink: 0 }}
                    >
                      {new Date(chat.lastUpdated).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: "#1890ff",
                      marginBottom: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {chat.productName}
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      color: "#595959",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontWeight:
                        chat.messages[chat.messages.length - 1]?.sender ===
                        "user"
                          ? "600"
                          : "400",
                    }}
                  >
                    {chat.messages[chat.messages.length - 1]?.sender === "admin"
                      ? "Bạn: "
                      : ""}
                    {chat.messages[chat.messages.length - 1]?.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- KHUNG CHAT CHÍNH --- */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "#fff",
        }}
      >
        {activeConversation ? (
          <>
            <div
              style={{
                padding: "12px 20px",
                borderBottom: "1px solid #e5e7eb",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                gap: 12,
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              }}
            >
              <img
                src={
                  activeConversation.productImage ||
                  "https://via.placeholder.com/40"
                }
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid #eee",
                }}
                alt=""
              />
              <div>
                <div
                  style={{ fontWeight: "700", fontSize: 16, color: "#262626" }}
                >
                  {activeConversation.userFullname}
                </div>
                <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                  Đang xem:{" "}
                  <span style={{ color: "#1890ff" }}>
                    {activeConversation.productName}
                  </span>
                </div>
              </div>

              {activeConversation.assignedAdminId !== user.id && (
                <span
                  style={{
                    marginLeft: "auto",
                    background: "#fff1f0",
                    color: "#cf1322",
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 4,
                    border: "1px solid #ffa39e",
                  }}
                >
                  ⚠️ Chat của {activeConversation.assignedAdminId}
                </span>
              )}
            </div>

            <div
              style={{
                flex: 1,
                padding: "20px",
                overflowY: "auto",
                background: "#f5f5f5",
              }}
            >
              {activeConversation.messages.map((m, i) => {
                const isMe = m.sender === "admin";
                const isBot = m.sender === "bot";
                const isShopSide = isMe || isBot;

                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: isShopSide ? "flex-end" : "flex-start",
                      marginBottom: 12,
                    }}
                  >
                    {/* Avatar Khách */}
                    {!isShopSide && (
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "#ddd",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 8,
                          fontSize: 12,
                        }}
                      >
                        👤
                      </div>
                    )}

                    <div
                      style={{
                        maxWidth: "65%",
                        background: isMe
                          ? "#1890ff"
                          : isBot
                          ? "#e6f7ff"
                          : "#fff",
                        color: isMe ? "#fff" : "#262626",
                        padding: "10px 14px",
                        borderRadius: 12,
                        borderTopRightRadius: isShopSide ? 2 : 12,
                        borderTopLeftRadius: !isShopSide ? 2 : 12,
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                        border: isBot ? "1px solid #91d5ff" : "none",
                      }}
                    >
                      {isBot && (
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: "700",
                            color: "#096dd9",
                            marginBottom: 4,
                          }}
                        >
                          🤖 AI Trợ lý
                        </div>
                      )}
                      <div style={{ lineHeight: 1.5 }}>{m.text}</div>
                      <div
                        style={{
                          fontSize: 10,
                          marginTop: 4,
                          textAlign: "right",
                          opacity: 0.7,
                        }}
                      >
                        {new Date(m.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    {isShopSide && (
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: isBot ? "#e6f7ff" : "#1890ff",
                          color: isBot ? "#096dd9" : "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginLeft: 8,
                          fontSize: 14,
                          border: isBot ? "1px solid #91d5ff" : "none",
                        }}
                      >
                        {isBot ? "🤖" : "🧑‍💻"}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div
              style={{
                padding: 20,
                borderTop: "1px solid #e5e7eb",
                background: "#fff",
                display: "flex",
                alignItems: "center",
              }}
            >
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleReply()}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: 24,
                  border: "1px solid #d9d9d9",
                  outline: "none",
                  fontSize: 14,
                  background: "#f5f5f5",
                }}
                placeholder="Nhập tin nhắn phản hồi..."
              />
              <button
                onClick={handleReply}
                style={{
                  marginLeft: 12,
                  padding: "0 24px",
                  height: 42,
                  borderRadius: 24,
                  background: "#1890ff",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "600",
                  boxShadow: "0 2px 4px rgba(24,144,255,0.2)",
                }}
              >
                Gửi
              </button>
            </div>
          </>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#bfbfbf",
              flexDirection: "column",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 10 }}>💬</div>
            <div>Chọn một cuộc hội thoại để bắt đầu hỗ trợ</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
