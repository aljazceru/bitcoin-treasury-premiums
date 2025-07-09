import { logger } from '../utils/logger';
import { ScrapedCompany } from '../models/types';
import { CSVParser } from '../utils/csvParser';

export class BitcoinTreasuriesScraper {

  constructor() {
  }

  async scrapeCompanies(): Promise<ScrapedCompany[]> {
    try {
      logger.info('Loading companies from treasuries.csv (temporary solution)');
      
      // Use CSV data temporarily until real scraping is implemented
      const csvPath = '/app/treasuries.csv';
      const companies = CSVParser.parseTreasuriesCSV(csvPath);
      
      logger.info(`Loaded ${companies.length} companies from CSV file`);
      return companies;

    } catch (error) {
      logger.error('Error loading companies from CSV:', error);
      logger.info('Falling back to hardcoded list...');
      
      // Fallback to a minimal hardcoded list if CSV fails
      const fallbackCompanies: ScrapedCompany[] = [
        { name: 'MicroStrategy', ticker: 'MSTR', btc_holdings: 444262, country: 'US', exchange: 'NASDAQ', shares_outstanding: 19.5 },
        { name: 'Marathon Digital Holdings', ticker: 'MARA', btc_holdings: 34794, country: 'US', exchange: 'NASDAQ', shares_outstanding: 240 },
        { name: 'Tesla', ticker: 'TSLA', btc_holdings: 9720, country: 'US', exchange: 'NASDAQ', shares_outstanding: 3180 }
      ];
      
      return fallbackCompanies;
    }
  }

}

export const bitcoinTreasuriesScraper = new BitcoinTreasuriesScraper();