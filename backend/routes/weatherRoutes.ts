import { Router } from 'express';
import * as weatherController from '../controllers/weatherController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.get('/', weatherController.getWeather);
router.get('/alerts', weatherController.getWeatherAlerts);

export default router;
