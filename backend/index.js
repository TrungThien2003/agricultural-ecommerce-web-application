const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const mainRoutes = require("./routes/index");
const createDefaultAdmin = require("./controllers/createDefaultAdmin");
const helmet = require("helmet");
const http = require("http");
const { Server } = require("socket.io");
const {
  getHistory,
  getAdminChats,
  sendClientMessage,
  sendAdminReply,
  handleAdminLogin,
  handleDisconnect,
} = require("./controllers/chat.controllers");

dotenv.config();

const app = express();

app.use(cors());
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use((req, res, next) => {
  req.io = io;
  next();
});

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("MongoDB connected");
    await createDefaultAdmin();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/api/chat/history", getHistory);
app.get("/api/admin/my-chats", getAdminChats);
app.post("/api/chat/send", sendClientMessage);
app.post("/api/admin/reply", sendAdminReply);
app.use("/api", mainRoutes);
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:5000"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  })
);

io.on("connection", (socket) => {
  socket.on("admin_login", (adminId) => {
    handleAdminLogin(socket, adminId);
  });

  socket.on("disconnect", () => {
    handleDisconnect(socket, io);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
console.log(mongoose.modelNames());
