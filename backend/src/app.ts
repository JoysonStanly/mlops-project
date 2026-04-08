import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes';
import uploadRoutes from './routes/uploadRoutes';
import resultRoutes from './routes/resultRoutes';
import historyRoutes from './routes/historyRoutes';
import { notFound, errorHandler } from './middleware/errorMiddleware';
import { env } from './config/env';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
  }),
);

app.get('/health', (_request, response) => {
  response.json({ status: 'ok', service: 'backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/history', historyRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
