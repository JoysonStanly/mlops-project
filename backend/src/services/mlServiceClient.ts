import axios from 'axios';
import { env } from '../config/env';

export type MlPredictionResponse = {
  ai_probability: number;
  effort_score: number;
  prediction: 'AI' | 'Human';
  explanation: string;
  feedback: string;
  model_version: string;
  features: {
    code_complexity: number;
    comment_ratio: number;
    repetition_score: number;
    text_perplexity: number;
    average_line_length: number;
    function_count: number;
    naming_diversity: number;
  };
};

export async function requestPrediction(payload: {
  fileName: string;
  fileType: string;
  textContent?: string;
  base64Content?: string;
}) {
  const { data } = await axios.post<MlPredictionResponse>(`${env.ML_SERVICE_URL}/predict`, payload, {
    timeout: 20000,
  });
  return data;
}
