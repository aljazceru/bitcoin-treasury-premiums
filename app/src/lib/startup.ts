let isInitialized = false;

export async function initializeApp() {
  if (isInitialized || typeof window !== 'undefined') {
    return;
  }

  try {
    // Dynamic import to avoid bundling server-only code
    const { schedulerService } = await import('../services/schedulerService');
    const { logger } = await import('../utils/logger');
    const { db } = await import('../models/database');
    
    logger.info('Initializing Bitcoin Treasury Tracker...');
    
    // Initialize database first
    await db.initialize();
    
    // Start scheduled tasks
    await schedulerService.start();
    
    isInitialized = true;
    logger.info('Bitcoin Treasury Tracker initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    throw error;
  }
}