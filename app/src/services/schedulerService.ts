import * as cron from 'node-cron';
import { logger } from '../utils/logger';
import { bitcoinPriceService } from './bitcoinPriceService';
import { stockPriceService } from './stockPriceService';
import { companyService } from './companyService';

export class SchedulerService {
  private tasks: cron.ScheduledTask[] = [];

  start(): void {
    // Update Bitcoin price every 30 minutes
    const btcUpdateInterval = process.env.BITCOIN_PRICE_UPDATE_INTERVAL || '30';
    const btcCronExpression = `*/${btcUpdateInterval} * * * *`;
    
    const btcTask = cron.schedule(btcCronExpression, async () => {
      logger.info('Running scheduled Bitcoin price update');
      try {
        await bitcoinPriceService.updatePrice();
      } catch (error) {
        logger.error('Failed to update Bitcoin price:', error);
      }
    });
    this.tasks.push(btcTask);

    // Update stock prices every 30 minutes during market hours, every 2 hours when closed
    const stockUpdateInterval = process.env.STOCK_PRICE_UPDATE_INTERVAL || '30';
    const stockCronExpression = `*/${stockUpdateInterval} * * * *`;
    
    const stockTask = cron.schedule(stockCronExpression, async () => {
      const isMarketOpen = stockPriceService.isMarketOpen();
      logger.info(`Running scheduled stock price update (market ${isMarketOpen ? 'open' : 'closed'})`);
      
      try {
        if (isMarketOpen) {
          // Update all stock prices when market is open
          await stockPriceService.updateAllStockPrices();
        } else {
          // When market is closed, only update major holdings every 2 hours
          const currentHour = new Date().getHours();
          if (currentHour % 2 === 0) {
            logger.info('Updating major holdings during market closure');
            await stockPriceService.updateAllStockPrices();
          } else {
            logger.info('Skipping stock price update (market closed, not scheduled hour)');
          }
        }
      } catch (error) {
        logger.error('Failed to update stock prices:', error);
      }
    });
    this.tasks.push(stockTask);

    // Update holdings data every 6 hours
    const holdingsUpdateInterval = parseInt(process.env.HOLDINGS_UPDATE_INTERVAL || '360');
    const holdingsHours = Math.floor(holdingsUpdateInterval / 60);
    const holdingsCronExpression = `0 */${holdingsHours} * * *`;
    
    const holdingsTask = cron.schedule(holdingsCronExpression, async () => {
      logger.info('Running scheduled holdings update');
      try {
        await companyService.updateCompaniesFromScraper();
      } catch (error) {
        logger.error('Failed to update holdings data:', error);
      }
    });
    this.tasks.push(holdingsTask);

    logger.info('Scheduler service started with the following tasks:');
    logger.info(`- Bitcoin price update: every ${btcUpdateInterval} minutes`);
    logger.info(`- Stock price update: every ${stockUpdateInterval} minutes (market hours), every 2 hours (market closed)`);
    logger.info(`- Holdings update: every ${holdingsHours} hours`);

    // Run initial updates
    this.runInitialUpdates();
  }

  private async runInitialUpdates(): Promise<void> {
    logger.info('Running initial data updates');
    
    try {
      // Try to update companies from scraper, but don't fail if it doesn't work
      try {
        await companyService.updateCompaniesFromScraper();
      } catch (scraperError) {
        logger.warn('Scraper failed, using seed data:', scraperError);
      }
      
      // Then update Bitcoin price
      await bitcoinPriceService.updatePrice();
      
      // Finally update stock prices
      logger.info('Fetching initial stock prices...');
      await stockPriceService.updateAllStockPrices();
    } catch (error) {
      logger.error('Error during initial updates:', error);
    }
  }

  stop(): void {
    this.tasks.forEach(task => task.stop());
    this.tasks = [];
    logger.info('Scheduler service stopped');
  }
}

export const schedulerService = new SchedulerService();