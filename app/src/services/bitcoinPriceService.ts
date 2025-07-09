import axios from 'axios';
import { logger } from '../utils/logger';
import { db } from '../models/database';
import { BitcoinPrice } from '../models/types';

export class BitcoinPriceService {
  private readonly apiUrl: string;
  
  constructor() {
    this.apiUrl = process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';
  }

  async fetchCurrentPrice(): Promise<number> {
    try {
      const response = await axios.get(`${this.apiUrl}/simple/price`, {
        params: {
          ids: 'bitcoin',
          vs_currencies: 'usd'
        },
        timeout: 10000
      });

      const price = response.data?.bitcoin?.usd;
      if (!price) {
        throw new Error('Invalid response from CoinGecko API');
      }

      logger.info(`Fetched Bitcoin price: $${price}`);
      return price;

    } catch (error) {
      logger.error('Error fetching Bitcoin price:', error);
      // Try to get the last known price from database
      try {
        const lastPrice = await this.getLastPrice();
        if (lastPrice) {
          logger.warn(`Using last known Bitcoin price: $${lastPrice.price}`);
          return lastPrice.price;
        }
      } catch (dbError) {
        logger.error('Error getting last Bitcoin price from database:', dbError);
      }
      throw error;
    }
  }

  async updatePrice(): Promise<BitcoinPrice> {
    await db.initialize();
    const price = await this.fetchCurrentPrice();
    
    await db.run(
      `INSERT INTO bitcoin_prices (price, currency, timestamp) VALUES (?, ?, datetime('now'))`,
      [price, 'USD']
    );

    return {
      price,
      currency: 'USD',
      timestamp: new Date().toISOString()
    };
  }

  async getLastPrice(): Promise<BitcoinPrice | undefined> {
    await db.initialize();
    return await db.get<BitcoinPrice>(
      `SELECT * FROM bitcoin_prices ORDER BY timestamp DESC LIMIT 1`
    );
  }

  async getPriceHistory(hours: number = 24): Promise<BitcoinPrice[]> {
    await db.initialize();
    return await db.all<BitcoinPrice>(
      `SELECT * FROM bitcoin_prices 
       WHERE timestamp > datetime('now', '-' || ? || ' hours')
       ORDER BY timestamp DESC`,
      [hours]
    );
  }
}

export const bitcoinPriceService = new BitcoinPriceService();