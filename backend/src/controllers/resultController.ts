import type { Request, Response } from 'express';
import { Prediction } from '../models/Prediction';

export async function getResult(request: Request, response: Response) {
  const { id } = request.params;
  const result = await Prediction.findOne({ _id: id, userId: request.user?.id }).lean();
  if (!result) {
    response.status(404);
    throw new Error('Result not found');
  }

  response.json({
    result: {
      ...result,
      id: result._id.toString(),
    },
  });
}
