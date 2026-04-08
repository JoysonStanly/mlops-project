import { Schema, model, type InferSchemaType, Types } from 'mongoose';

const predictionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    uploadId: { type: Schema.Types.ObjectId, ref: 'Upload', required: true },
    fileName: { type: String, required: true },
    aiProbability: { type: Number, required: true },
    effortScore: { type: Number, required: true },
    feedback: { type: String, required: true },
    predictionLabel: { type: String, enum: ['AI', 'Human'], default: 'Human' },
    explanation: { type: String, default: '' },
    modelVersion: { type: String, default: 'v1.0.0' },
    features: {
      codeComplexity: { type: Number, default: 0 },
      commentRatio: { type: Number, default: 0 },
      repetitionScore: { type: Number, default: 0 },
      textPerplexity: { type: Number, default: 0 },
      averageLineLength: { type: Number, default: 0 },
      functionCount: { type: Number, default: 0 },
      namingDiversity: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

export type PredictionDocument = InferSchemaType<typeof predictionSchema> & { _id: Types.ObjectId };
export const Prediction = model('Prediction', predictionSchema);
