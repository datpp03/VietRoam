import express from "express";
import userController from "../app/controllers/userController";
import authMiddleware from "../app/middlewares/authMiddleware";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file ảnh"), false);
    }
  },
});
const router = express.Router();

router.get("/searchfollow", authMiddleware, userController.searchUsers);
router.get("/search", userController.searchAllUsers);
router.post("/follow", authMiddleware, userController.followUser);
router.post("/unfollow", authMiddleware, userController.unfollowUser);
router.get("/:id", authMiddleware, userController.getUser);
router.get("/profile/:username", userController.getProfileUser);
router.post("/batch", userController.getUsersBatch);
router.put("/:id",authMiddleware,upload.single("profile_picture"),userController.updateUser);

export default router;
