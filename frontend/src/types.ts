export type User = {
  id: string;
  name: string;
  email: string;
};

export type Prediction = {
  id: string;
  fileName: string;
  status?: 'pending' | 'completed' | 'failed';
  aiProbability: number;
  effortScore: number;
  feedback: string;
  predictionLabel?: 'AI' | 'Human';
  explanation?: string;
  createdAt: string;
  modelVersion?: string;
  features?: {
    codeComplexity: number;
    commentRatio: number;
    repetitionScore: number;
    textPerplexity: number;
    averageLineLength?: number;
    functionCount?: number;
    namingDiversity?: number;
  };
};

export type AuthResponse = {
  token: string;
  user: User;
};
