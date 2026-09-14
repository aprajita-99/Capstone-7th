import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware';

// Extracts pure setup logic mapped over test harnesses
export const createApp = () => {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api', routes);
    
    app.get('/health', (req, res) => {
        res.json({ status: 'ok', db: 'connected' });
    });

    app.use(errorHandler);
    return app;
};
