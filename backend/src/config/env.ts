import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 4000),
  MONGODB_URI: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/ai-project-evaluator'),
  JWT_SECRET: required('JWT_SECRET', 'development_secret_change_me'),
  CLIENT_URL: required('CLIENT_URL', 'http://localhost:3000'),
  ML_SERVICE_URL: required('ML_SERVICE_URL', 'http://localhost:8000'),
};
