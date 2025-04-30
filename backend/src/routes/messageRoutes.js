import express from "express";
import messageController from "../app/controllers/messageController";
import authMiddleware from "../app/middlewares/authMiddleware";
import multer from "multer";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.use(authMiddleware);
router.get("/conversations", messageController.getConversations);
router.get("/conversations/:conversationId", messageController.getMessages);
router.post("/send", messageController.sendMessage);
router.put("/mark-read/:messageId", messageController.markAsRead);
router.put("/mark-all-read/:conversationId", messageController.markAllAsRead);
router.post("/upload", upload.array("files", 10), messageController.uploadMedia);

export default router;