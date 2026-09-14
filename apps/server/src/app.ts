import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware';
import prisma from './lib/prisma';

// Extracts pure setup logic mapped over test harnesses
export const createApp = () => {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api', routes);
    
    app.get('/health', async (req, res) => {
        try {
            await prisma.$queryRaw`SELECT 1`;
            res.json({ status: 'ok', db: 'connected' });
        } catch (error) {
            res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Database unreachable' } });
        }
    });

    app.use(errorHandler);
    return app;
};
