import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import uploadRoutes from './routes/upload.routes';
import comparisonRoutes from './routes/comparison.routes';
import approvalRoutes from './routes/approval.routes';
import kpiRoutes from './routes/kpi.routes';
import webhookRoutes from './routes/webhook.routes';

import { errorHandler } from './middleware/error-handler';
import { logger } from './utils/logger';

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '3001');
const NODE_ENV: string = process.env.NODE_ENV || 'development';

app.set('trust proxy', 1);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime()
  });
});

app.use('/api/upload', uploadRoutes);
app.use('/api/comparison', comparisonRoutes);
app.use('/api/approval', approvalRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/webhook', webhookRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Endpoint not found',
      path: req.path,
      method: req.method
    }
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`🚀 QuoteCraft Backend running on port ${PORT}`);
  logger.info(`📍 Environment: ${NODE_ENV}`);
  logger.info(`🔗 API Base URL: http://localhost:${PORT}/api`);
});

export default app;
