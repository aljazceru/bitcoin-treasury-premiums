import { db } from '../models/database';
import { Company } from '../models/types';
import { logger } from './logger';

// Initial company data based on known Bitcoin treasury holdings
const initialCompanies: Omit<Company, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'MicroStrategy',
    ticker: 'MSTR',
    exchange: 'NASDAQ',
    country_code: 'US',
    btc_holdings: 190000,
    shares_outstanding: 19.5,
    last_holdings_update: new Date().toISOString()
  },
  {
    name: 'Tesla',
    ticker: 'TSLA',
    exchange: 'NASDAQ',
    country_code: 'US',
    btc_holdings: 9720,
    shares_outstanding: 3180,
    last_holdings_update: new Date().toISOString()
  },
  {
    name: 'Block Inc',
    ticker: 'SQ',
    exchange: 'NYSE',
    country_code: 'US',
    btc_holdings: 8027,
    shares_outstanding: 580,
    last_holdings_update: new Date().toISOString()
  },
  {
    name: 'Coinbase',
    ticker: 'COIN',
    exchange: 'NASDAQ',
    country_code: 'US',
    btc_holdings: 9000,
    shares_outstanding: 230,
    last_holdings_update: new Date().toISOString()
  },
  {
    name: 'Marathon Digital',
    ticker: 'MARA',
    exchange: 'NASDAQ',
    country_code: 'US',
    btc_holdings: 15174,
    shares_outstanding: 240,
    last_holdings_update: new Date().toISOString()
  },
  {
    name: 'Riot Platforms',
    ticker: 'RIOT',
    exchange: 'NASDAQ',
    country_code: 'US',
    btc_holdings: 7327,
    shares_outstanding: 170,
    last_holdings_update: new Date().toISOString()
  },
  {
    name: 'Hut 8 Mining',
    ticker: 'HUT',
    exchange: 'NASDAQ',
    country_code: 'CA',
    btc_holdings: 9086,
    shares_outstanding: 90,
    last_holdings_update: new Date().toISOString()
  },
  {
    name: 'CleanSpark',
    ticker: 'CLSK',
    exchange: 'NASDAQ',
    country_code: 'US',
    btc_holdings: 5165,
    shares_outstanding: 220,
    last_holdings_update: new Date().toISOString()
  },
  {
    name: 'Galaxy Digital',
    ticker: 'GLXY.TO',
    exchange: 'TSX',
    country_code: 'CA',
    btc_holdings: 8100,
    shares_outstanding: 32,
    last_holdings_update: new Date().toISOString()
  },
  {
    name: 'Bitfarms',
    ticker: 'BITF',
    exchange: 'NASDAQ',
    country_code: 'CA',
    btc_holdings: 1000,
    shares_outstanding: 440,
    last_holdings_update: new Date().toISOString()
  }
];

export async function seedDatabase(): Promise<void> {
  try {
    // Check if we already have companies
    const existingCompanies = await db.all<Company>('SELECT * FROM companies');
    
    if (existingCompanies.length === 0) {
      logger.info('No companies found, seeding database with initial data...');
      
      for (const company of initialCompanies) {
        await db.run(
          `INSERT INTO companies (name, ticker, exchange, country_code, btc_holdings, shares_outstanding, last_holdings_update)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            company.name,
            company.ticker,
            company.exchange,
            company.country_code,
            company.btc_holdings,
            company.shares_outstanding,
            company.last_holdings_update
          ]
        );
        logger.info(`Added company: ${company.name} (${company.ticker})`);
      }
      
      logger.info(`Successfully seeded ${initialCompanies.length} companies`);
    } else {
      logger.info(`Database already contains ${existingCompanies.length} companies`);
    }
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  }
}