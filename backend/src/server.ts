import { createServer } from 'http';
import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';

async function bootstrap() {
  await connectDatabase();

  const server = createServer(app);
  server.listen(env.PORT, () => {
    console.log(`Backend API listening on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start backend', error);
  process.exit(1);
});
