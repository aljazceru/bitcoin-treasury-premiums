import dotenv from 'dotenv';
import { createApp } from './app';
import { db } from './models/database';
import { schedulerService } from './services/schedulerService';
import { logger } from './utils/logger';
import { seedDatabase } from './utils/seedData';

// Load environment variables
dotenv.config();

// Validate critical environment variables
const requiredEnvVars = {
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Log environment configuration
logger.info('Environment configuration loaded:', {
  NODE_ENV: requiredEnvVars.NODE_ENV,
  PORT: process.env.PORT || 3001,
  DATABASE_PATH: process.env.DATABASE_PATH || './data/treasury.db',
  BITCOIN_PRICE_UPDATE_INTERVAL: process.env.BITCOIN_PRICE_UPDATE_INTERVAL || '30',
  STOCK_PRICE_UPDATE_INTERVAL: process.env.STOCK_PRICE_UPDATE_INTERVAL || '30',
  HOLDINGS_UPDATE_INTERVAL: process.env.HOLDINGS_UPDATE_INTERVAL || '360'
});

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Initialize database
    await db.initialize();
    logger.info('Database initialized');

    // Seed initial data if needed
    await seedDatabase();

    // Create Express app
    const app = createApp();

    // Start scheduler
    schedulerService.start();

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      schedulerService.stop();
      server.close(() => {
        db.close().then(() => {
          logger.info('Database connection closed');
          process.exit(0);
        });
      });
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully');
      schedulerService.stop();
      server.close(() => {
        db.close().then(() => {
          logger.info('Database connection closed');
          process.exit(0);
        });
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();