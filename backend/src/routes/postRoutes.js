import express from 'express';
import postController from '../app/controllers/postController.js';
import authMiddleware from '../app/middlewares/authMiddleware.js';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh hoặc video'), false);
    }
  },
});

const router = express.Router();

router.get('/posts/:myId', postController.getPostsIsLogin);
router.get('/posts/likes/:myId', postController.getLikedPosts);
router.get('/posts/following/:myId', postController.getPostsFollowing);
router.get('/posts/user/:userId', postController.getUserPosts);
router.get('/myposts/:userId', postController.getMyPosts);
router.get('/posts', postController.getPosts);
router.post('/posts', authMiddleware, upload.array('media', 50), postController.createPost);
router.post('/posts/:postId/like', authMiddleware, postController.toggleLike);
router.delete('/posts/:postId/like', authMiddleware, postController.toggleLike);
router.get('/posts/:postId/comments', postController.getComments);
router.post('/posts/:postId/comments', authMiddleware, postController.createComment);
router.delete('/posts/:postId', authMiddleware, postController.deletePost);
router.patch('/posts/:postId/archive', authMiddleware, postController.archivePost);
router.patch('/posts/:postId/status', authMiddleware, postController.updatePostStatus);

export default router;