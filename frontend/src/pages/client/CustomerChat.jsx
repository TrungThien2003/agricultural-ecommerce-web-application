import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import API from "../../api";
import { useSelector } from "react-redux";

const CustomerChat = ({ product }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const isSendingRef = useRef(false);

  const user = useSelector((state) => state.user);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        console.log("User loaded::", user);
        const { data } = await API.get("/chat/history", {
          params: { userId: user?.id, productId: product.id },
        });
        setMessages(data);
      } catch (e) {
        console.error(e);
      }
    };
    if (isOpen) loadHistory();

    socketRef.current = io("http://localhost:5000");
    socketRef.current.on(`msg_client_${user?.id}`, (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socketRef.current.disconnect();
  }, [isOpen, product.id, user]);

  useEffect(
    () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
    [messages, isOpen]
  );

  const handleSend = async () => {
    if (!input.trim() || isSendingRef.current) return;
    const text = input;
    setInput("");
    isSendingRef.current = true;
    setIsSending(true);

    try {
      await API.post("/chat/send", {
        userId: user.id,
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        productDesc: product.desc,
        text,
      });
    } catch (e) {
      alert("Lỗi gửi tin!");
    } finally {
      setIsSending(false);
      isSendingRef.current = false;
    }
  };

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} style={styles.btnOpen}>
          💬 Tư vấn {product.name}
        </button>
      ) : (
        <div style={styles.box}>
          <div style={styles.header}>
            <span>Hỗ trợ: {product.name}</span>
            <button onClick={() => setIsOpen(false)} style={styles.btnClose}>
              ✖
            </button>
          </div>
          <div style={styles.body}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  ...styles.row,
                  justifyContent:
                    m.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    ...styles.bubble,
                    background:
                      m.sender === "user"
                        ? "#007bff"
                        : m.sender === "admin"
                        ? "#f39c12"
                        : "#e5e5ea",
                    color:
                      m.sender === "user" || m.sender === "admin"
                        ? "#fff"
                        : "#000",
                  }}
                >
                  {m.sender === "bot" && (
                    <small
                      style={{
                        display: "block",
                        fontSize: "10px",
                        color: "#666",
                      }}
                    >
                      🤖 AI
                    </small>
                  )}
                  {m.sender === "admin" && (
                    <small
                      style={{
                        display: "block",
                        fontSize: "10px",
                        color: "#fff",
                      }}
                    >
                      👨‍💻 Admin
                    </small>
                  )}
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div style={styles.footer}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              style={styles.input}
              placeholder="Nhập tin nhắn..."
            />
            <button
              onClick={handleSend}
              style={styles.btnSend}
              disabled={isSending || !input.trim()}
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  btnOpen: {
    padding: "12px 20px",
    borderRadius: "30px",
    background: "#27ae60",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  },
  box: {
    width: "320px",
    height: "450px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "15px",
    background: "#27ae60",
    color: "#fff",
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
    display: "flex",
    justifyContent: "space-between",
  },
  btnClose: {
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
  },
  body: { flex: 1, padding: "10px", overflowY: "auto", background: "#f9f9f9" },
  footer: { padding: "10px", borderTop: "1px solid #eee", display: "flex" },
  input: {
    flex: 1,
    padding: "8px",
    borderRadius: "20px",
    border: "1px solid #ccc",
    outline: "none",
  },
  btnSend: {
    marginLeft: "8px",
    padding: "0 15px",
    borderRadius: "20px",
    background: "#27ae60",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  row: { display: "flex", marginBottom: "8px" },
  bubble: {
    padding: "8px 12px",
    borderRadius: "15px",
    maxWidth: "80%",
    fontSize: "14px",
  },
};

export default CustomerChat;
