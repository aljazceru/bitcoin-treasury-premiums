import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { apiController } from './controllers/apiController';
import { logger } from './utils/logger';

export function createApp(): Application {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS configuration
  if (process.env.NODE_ENV === 'development') {
    // Development: Allow specific origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173', // Vite dev server
      process.env.FRONTEND_URL
    ].filter((origin): origin is string => Boolean(origin));

    app.use(cors({
      origin: allowedOrigins,
      credentials: true
    }));
  } else {
    // Production: Backend is behind reverse proxy, no CORS needed
    // All requests come from the same domain via nginx
    app.use(cors({
      origin: true, // Accept all origins since requests come through reverse proxy
      credentials: true
    }));
  }

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later.'
  });
  app.use('/api/', limiter);

  // Request logging middleware
  app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    next();
  });

  // API routes
  app.get('/api/companies', apiController.getCompanies);
  app.get('/api/companies/:ticker', apiController.getCompany);
  app.get('/api/bitcoin-price', apiController.getBitcoinPrice);
  app.get('/api/price-history', apiController.getPriceHistory);
  app.post('/api/update-prices', apiController.updatePrices);
  app.get('/api/market-status', apiController.getMarketStatus);

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  });

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found',
      timestamp: new Date().toISOString()
    });
  });

  // Error handling middleware
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  });

  return app;
}