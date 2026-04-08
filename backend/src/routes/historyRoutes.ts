import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware';
import { getHistory } from '../controllers/historyController';

const router = Router();

router.get('/', protect, asyncHandler(getHistory));

export default router;
