import { db } from '../models/database';
import { Company, TreasuryData } from '../models/types';
import { bitcoinTreasuriesScraper } from '../scrapers/bitcoinTreasuriesScraper';
import { logger } from '../utils/logger';

export class CompanyService {
  async updateCompaniesFromScraper(): Promise<void> {
    try {
      const scrapedCompanies = await bitcoinTreasuriesScraper.scrapeCompanies();
      
      for (const scraped of scrapedCompanies) {
        const existing = await db.get<Company>(
          `SELECT * FROM companies WHERE ticker = ?`,
          [scraped.ticker]
        );

        if (existing) {
          // Update existing company with all available data
          await db.run(
            `UPDATE companies 
             SET btc_holdings = ?, 
                 country_code = ?,
                 exchange = ?,
                 shares_outstanding = ?,
                 last_holdings_update = datetime('now'),
                 updated_at = datetime('now')
             WHERE ticker = ?`,
            [
              scraped.btc_holdings, 
              scraped.country || 'US', 
              scraped.exchange || null,
              scraped.shares_outstanding || null,
              scraped.ticker
            ]
          );
        } else {
          // Insert new company with all available data
          await db.run(
            `INSERT INTO companies (name, ticker, exchange, country_code, btc_holdings, shares_outstanding, last_holdings_update)
             VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
            [
              scraped.name, 
              scraped.ticker, 
              scraped.exchange || null,
              scraped.country || 'US', 
              scraped.btc_holdings,
              scraped.shares_outstanding || null
            ]
          );
        }
      }

      logger.info(`Updated ${scrapedCompanies.length} companies from scraper`);
    } catch (error) {
      logger.error('Error updating companies from scraper:', error);
      throw error;
    }
  }

  async getAllCompanies(): Promise<Company[]> {
    return await db.all<Company>(
      `SELECT * FROM companies ORDER BY btc_holdings DESC`
    );
  }

  async getCompanyByTicker(ticker: string): Promise<Company | undefined> {
    return await db.get<Company>(
      `SELECT * FROM companies WHERE ticker = ?`,
      [ticker]
    );
  }

  async getTreasuryData(): Promise<TreasuryData[]> {
    // Get the latest Bitcoin price
    const btcPrice = await db.get<{ price: number }>(
      `SELECT price FROM bitcoin_prices ORDER BY timestamp DESC LIMIT 1`
    );

    if (!btcPrice) {
      throw new Error('No Bitcoin price available');
    }

    // Get all companies with their latest stock prices
    const companies = await db.all<TreasuryData>(
      `SELECT 
        c.*,
        sp.price as stock_price,
        sp.timestamp as price_timestamp
       FROM companies c
       LEFT JOIN (
         SELECT ticker, price, timestamp,
                ROW_NUMBER() OVER (PARTITION BY ticker ORDER BY timestamp DESC) as rn
         FROM stock_prices
       ) sp ON c.ticker = sp.ticker AND sp.rn = 1
       ORDER BY c.btc_holdings DESC`
    );

    // Calculate additional metrics
    return companies.map(company => {
      if (company.stock_price && company.shares_outstanding) {
        company.market_cap = company.stock_price * company.shares_outstanding * 1000000;
        company.btc_value = company.btc_holdings * btcPrice.price;
        
        // New metrics replacing NAV calculation
        company.btc_nav_multiple = company.btc_value > 0 ? company.market_cap / company.btc_value : 0;
        company.btc_per_share = company.btc_holdings / (company.shares_outstanding * 1000000);
        company.btc_holdings_percentage = company.market_cap > 0 ? (company.btc_value / company.market_cap) * 100 : 0;
      }
      return company;
    });
  }

  async addCompany(company: Omit<Company, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    await db.run(
      `INSERT INTO companies (name, ticker, exchange, country_code, btc_holdings, shares_outstanding)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        company.name,
        company.ticker,
        company.exchange || null,
        company.country_code || 'US',
        company.btc_holdings,
        company.shares_outstanding || null
      ]
    );
  }

  async updateCompany(ticker: string, updates: Partial<Company>): Promise<void> {
    const fields = [];
    const values = [];
    
    if (updates.btc_holdings !== undefined) {
      fields.push('btc_holdings = ?');
      values.push(updates.btc_holdings);
    }
    if (updates.shares_outstanding !== undefined) {
      fields.push('shares_outstanding = ?');
      values.push(updates.shares_outstanding);
    }
    if (updates.exchange !== undefined) {
      fields.push('exchange = ?');
      values.push(updates.exchange);
    }
    if (updates.country_code !== undefined) {
      fields.push('country_code = ?');
      values.push(updates.country_code);
    }

    if (fields.length > 0) {
      fields.push('updated_at = datetime("now")');
      values.push(ticker);
      
      await db.run(
        `UPDATE companies SET ${fields.join(', ')} WHERE ticker = ?`,
        values
      );
    }
  }
}

export const companyService = new CompanyService();