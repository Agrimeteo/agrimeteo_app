import { Router } from 'express';
import * as authController from '../controllers/authController.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);

router.get('/me', authController.me);

export default router;
