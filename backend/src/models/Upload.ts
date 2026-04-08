import { Schema, model, type InferSchemaType, Types } from 'mongoose';

const uploadSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    resultId: { type: Schema.Types.ObjectId, ref: 'Prediction' },
  },
  { timestamps: true },
);

export type UploadDocument = InferSchemaType<typeof uploadSchema> & { _id: Types.ObjectId };
export const Upload = model('Upload', uploadSchema);
