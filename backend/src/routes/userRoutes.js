import express from "express";
import userController from "../app/controllers/userController";
import authMiddleware from "../app/middlewares/authMiddleware";

const router = express.Router();

router.get("/search", authMiddleware, userController.searchUsers);
router.post("/follow", authMiddleware, userController.followUser);
router.post("/unfollow", authMiddleware, userController.unfollowUser);
router.get("/:id", authMiddleware, userController.getUser);

export default router;