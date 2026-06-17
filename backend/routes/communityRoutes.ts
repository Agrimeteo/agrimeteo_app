import { Router } from 'express';
import * as communityController from '../controllers/communityController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';

const router = Router();

router.use(authMiddleware);

// Community feed routes for the main crop management app.
router.get('/', communityController.listPosts);
router.post('/', communityController.createPost);
router.get('/admin/posts', adminMiddleware, communityController.listPostsForModeration);
router.patch('/admin/posts/:postId', adminMiddleware, communityController.updatePost);
router.delete('/admin/posts/:postId', adminMiddleware, communityController.deletePost);
router.post('/:postId/comments', communityController.addComment);
router.post('/:postId/likes', communityController.toggleLike);
router.patch('/comments/:commentId', communityController.updateComment);
router.delete('/comments/:commentId', communityController.deleteComment);
router.get('/:postId', communityController.getPost);
router.patch('/:postId', communityController.updatePost);
router.delete('/:postId', communityController.deletePost);

export default router;
