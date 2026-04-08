import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { login, register } from '../controllers/authController';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));

export default router;
