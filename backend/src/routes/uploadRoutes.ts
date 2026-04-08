import { Router } from 'express';
import multer from 'multer';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware';
import { uploadProject } from '../controllers/uploadController';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
const router = Router();

router.post('/', protect, upload.single('file'), asyncHandler(uploadProject));

export default router;
