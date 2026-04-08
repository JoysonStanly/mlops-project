import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User';
import { env } from '../config/env';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please provide a valid email.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function zodMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? 'Invalid request payload';
}

function signToken(user: { id: string; email: string; name: string }) {
  return jwt.sign(user, env.JWT_SECRET, { expiresIn: '7d' });
}

export async function register(request: Request, response: Response) {
  const parsed = registerSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400);
    throw new Error(zodMessage(parsed.error));
  }

  const { name, email, password } = parsed.data;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    response.status(409);
    throw new Error('Email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });

  response.status(201).json({
    token: signToken({ id: user._id.toString(), email: user.email, name: user.name }),
    user: { id: user._id.toString(), name: user.name, email: user.email },
  });
}

export async function login(request: Request, response: Response) {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400);
    throw new Error(zodMessage(parsed.error));
  }

  const { email, password } = parsed.data;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    response.status(401);
    throw new Error('Invalid email or password');
  }

  response.json({
    token: signToken({ id: user._id.toString(), email: user.email, name: user.name }),
    user: { id: user._id.toString(), name: user.name, email: user.email },
  });
}
