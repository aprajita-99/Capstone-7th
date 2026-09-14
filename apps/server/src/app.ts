import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware';
import prisma from './lib/prisma';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', db: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

app.use('/api', routes);
app.use(errorHandler);

export default app;
