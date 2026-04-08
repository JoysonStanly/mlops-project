import type { Request, Response } from 'express';
import { Prediction } from '../models/Prediction';

export async function getHistory(request: Request, response: Response) {
  if (!request.user) {
    response.status(401);
    throw new Error('Not authorized');
  }

  const predictions = await Prediction.find({ userId: request.user.id }).sort({ createdAt: -1 }).lean();
  response.json({
    predictions: predictions.map((item) => ({
      ...item,
      id: item._id.toString(),
    })),
  });
}
