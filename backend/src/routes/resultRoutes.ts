import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware';
import { getResult } from '../controllers/resultController';

const router = Router();

router.get('/:id', protect, asyncHandler(getResult));

export default router;
