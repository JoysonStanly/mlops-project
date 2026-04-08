import type { Request, Response } from 'express';
import { Upload } from '../models/Upload';
import { Prediction } from '../models/Prediction';
import { requestPrediction } from '../services/mlServiceClient';
import { toTextContent, isZipFile, extractZipContent } from '../utils/fileContent';

export async function uploadProject(request: Request, response: Response) {
  const file = request.file;
  if (!file || !request.user) {
    response.status(400);
    throw new Error('File upload is required');
  }

  const description = typeof request.body.description === 'string' ? request.body.description : '';
  const upload = await Upload.create({
    userId: request.user.id,
    fileName: file.originalname,
    fileType: file.mimetype,
    fileSize: file.size,
    description,
    status: 'pending',
  });

  let textContent: string | undefined;

  // Handle ZIP files
  if (isZipFile(file.originalname)) {
    textContent = extractZipContent(file.buffer);
  } else {
    // Handle regular files
    textContent = toTextContent(file.buffer, file.originalname);
  }

  const predictionInput = {
    fileName: file.originalname,
    fileType: file.mimetype,
    textContent: textContent,
    base64Content: file.buffer.toString('base64'),
  };

  const mlResult = await requestPrediction(predictionInput);
  const prediction = await Prediction.create({
    userId: request.user.id,
    uploadId: upload._id,
    fileName: file.originalname,
    aiProbability: mlResult.ai_probability,
    effortScore: mlResult.effort_score,
    feedback: mlResult.feedback,
    predictionLabel: mlResult.prediction,
    explanation: mlResult.explanation,
    modelVersion: mlResult.model_version,
    features: {
      codeComplexity: mlResult.features.code_complexity,
      commentRatio: mlResult.features.comment_ratio,
      repetitionScore: mlResult.features.repetition_score,
      textPerplexity: mlResult.features.text_perplexity,
      averageLineLength: mlResult.features.average_line_length,
      functionCount: mlResult.features.function_count,
      namingDiversity: mlResult.features.naming_diversity,
    },
  });

  upload.status = 'completed';
  upload.resultId = prediction._id;
  await upload.save();

  response.status(201).json({
    resultId: prediction._id.toString(),
    uploadId: upload._id.toString(),
  });
}
