import express from "express";
import http from "http";
import { Server } from "socket.io";
import "dotenv/config.js";
import mongoose from "mongoose";
import cors from "cors";
import methodOverride from "method-override";
import bodyParser from "body-parser";
import path from "path";
import routes from "./src/routes";
import socketHandler from "./src/socket/socketHandler";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGODB_URL, {
    autoIndex: false,
  })
  .then(() => {
    console.log("Kết nối MongoDB thành công");
  })
  .catch((err) => {
    console.error("Lỗi kết nối MongoDB:", err);
    process.exit();
  });

app.use((err, req, res, next) => {
  const firebaseErrors = {
    "auth/id-token-expired": 401,
    "auth/invalid-id-token": 401,
    "auth/argument-error": 400,
  };

  const statusCode = firebaseErrors[err.code] || 500;

  res.status(statusCode).json({
    error: err.message || "Internal Server Error",
    code: err.code,
  });
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(methodOverride("_method"));

// Thêm routes
routes(app);

// Khởi tạo Socket.IO handler
socketHandler(io);

// Khởi động Server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server chạy tại: http://localhost:${PORT}`);
});