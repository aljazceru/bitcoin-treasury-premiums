import axios from 'axios';
import { logger } from '../utils/logger';
import { db } from '../models/database';
import { StockPrice, Company } from '../models/types';

export class StockPriceService {
  private readonly yahooFinanceUrl: string;
  
  constructor() {
    this.yahooFinanceUrl = process.env.YAHOO_FINANCE_API_URL || 'https://query1.finance.yahoo.com/v8/finance';
  }

  async fetchStockPrice(ticker: string): Promise<{ price: number; sharesOutstanding?: number }> {
    let lastError: Error;

    // Try primary Yahoo Finance API v8 endpoint
    try {
      const response = await axios.get(`${this.yahooFinanceUrl}/chart/${ticker}`, {
        headers: {
          'User-Agent': process.env.USER_AGENT || 'Mozilla/5.0 (compatible; BTC-Treasury-Bot/1.0)'
        },
        timeout: 10000
      });

      const result = response.data?.chart?.result?.[0];
      if (!result) {
        throw new Error(`No data found for ticker ${ticker}`);
      }

      const meta = result.meta;
      const price = meta.regularMarketPrice || meta.previousClose;
      const sharesOutstanding = meta.sharesOutstanding;

      if (!price) {
        throw new Error(`No price data found for ticker ${ticker}`);
      }

      logger.info(`Fetched stock price for ${ticker}: $${price}`);
      return { price, sharesOutstanding };

    } catch (error) {
      lastError = error as Error;
      logger.warn(`Primary API failed for ${ticker}, trying fallback:`, error);
    }

    // Fallback to alternative Yahoo Finance endpoint
    try {
      const altResponse = await axios.get(`https://finance.yahoo.com/quote/${ticker}`, {
        headers: {
          'User-Agent': process.env.USER_AGENT || 'Mozilla/5.0 (compatible; BTC-Treasury-Bot/1.0)'
        },
        timeout: 10000
      });

      // Parse price from HTML (as a fallback)
      const priceMatch = altResponse.data.match(/regularMarketPrice":{"raw":(\d+\.?\d*)/);
      const sharesMatch = altResponse.data.match(/sharesOutstanding":{"raw":(\d+)/);
      
      if (priceMatch) {
        const price = parseFloat(priceMatch[1]);
        const sharesOutstanding = sharesMatch ? parseInt(sharesMatch[1]) : undefined;
        logger.info(`Fetched stock price for ${ticker} via fallback: $${price}`);
        return { price, sharesOutstanding };
      }
    } catch (altError) {
      logger.error(`Fallback API also failed for ${ticker}:`, altError);
    }

    // Try to get last known price as final fallback
    try {
      const lastPrice = await this.getLastPrice(ticker);
      if (lastPrice) {
        logger.warn(`Using last known price for ${ticker}: $${lastPrice.price}`);
        return { price: lastPrice.price };
      }
    } catch (dbError) {
      logger.error(`Failed to get last known price for ${ticker}:`, dbError);
    }

    logger.error(`All attempts failed for ${ticker}`);
    throw new Error(`Failed to fetch stock price for ${ticker}: ${lastError.message}`);
  }

  async updateStockPrice(ticker: string): Promise<StockPrice> {
    const { price, sharesOutstanding } = await this.fetchStockPrice(ticker);
    
    // Update stock price
    await db.run(
      `INSERT INTO stock_prices (ticker, price, currency, timestamp) VALUES (?, ?, ?, datetime('now'))`,
      [ticker, price, 'USD']
    );

    // Update shares outstanding if available
    if (sharesOutstanding) {
      await db.run(
        `UPDATE companies SET shares_outstanding = ?, updated_at = datetime('now') WHERE ticker = ?`,
        [sharesOutstanding / 1000000, ticker] // Convert to millions
      );
    }

    logger.info(`Updated stock price for ${ticker}: $${price}`);

    return {
      ticker,
      price,
      currency: 'USD',
      timestamp: new Date().toISOString()
    };
  }

  async updateAllStockPrices(): Promise<void> {
    const companies = await db.all<Company>(`SELECT ticker FROM companies`);
    
    for (const company of companies) {
      try {
        await this.updateStockPrice(company.ticker);
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        logger.error(`Failed to update price for ${company.ticker}:`, error);
      }
    }
  }

  async getLastPrice(ticker: string): Promise<StockPrice | undefined> {
    return await db.get<StockPrice>(
      `SELECT * FROM stock_prices WHERE ticker = ? ORDER BY timestamp DESC LIMIT 1`,
      [ticker]
    );
  }

  async getPriceHistory(ticker: string, hours: number = 24): Promise<StockPrice[]> {
    return await db.all<StockPrice>(
      `SELECT * FROM stock_prices 
       WHERE ticker = ? AND timestamp > datetime('now', '-' || ? || ' hours')
       ORDER BY timestamp DESC`,
      [ticker, hours]
    );
  }

  isMarketOpen(): boolean {
    const now = new Date();
    const easternTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const day = easternTime.getDay();
    const hour = easternTime.getHours();
    const minute = easternTime.getMinutes();
    
    // Monday-Friday, 9:30 AM - 4:00 PM ET
    return day >= 1 && day <= 5 && 
           ((hour === 9 && minute >= 30) || (hour > 9 && hour < 16));
  }
}

export const stockPriceService = new StockPriceService();