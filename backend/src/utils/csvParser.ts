import fs from 'fs';
import { logger } from './logger';
import { ScrapedCompany } from '../models/types';

export class CSVParser {
  
  static parseTreasuriesCSV(csvPath: string): ScrapedCompany[] {
    try {
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.split('\n');
      
      // Skip header line
      const dataLines = lines.slice(1).filter(line => line.trim());
      
      const companies: ScrapedCompany[] = [];
      
      for (const line of dataLines) {
        const parsed = this.parseCSVLine(line);
        if (parsed) {
          companies.push(parsed);
        }
      }
      
      logger.info(`Parsed ${companies.length} companies from CSV`);
      return companies;
      
    } catch (error) {
      logger.error('Error parsing CSV:', error);
      throw error;
    }
  }
  
  private static parseCSVLine(line: string): ScrapedCompany | null {
    try {
      // Parse CSV line handling quoted fields
      const fields = this.parseCSVFields(line);
      
      if (fields.length < 4) {
        return null;
      }
      
      const [, countryFlag, nameAndTicker, btcHoldings] = fields;
      
      // Extract Bitcoin holdings (remove ₿ symbol and commas)
      // Handle formats like ₿597,325 or ₿.2 or ₿0
      const btcMatch = btcHoldings.match(/₿([\d,]*\.?\d*)/);
      if (!btcMatch) {
        return null;
      }
      
      const btc_holdings = parseFloat(btcMatch[1].replace(/,/g, ''));
      
      // Skip entries with 0 holdings only
      if (btc_holdings <= 0) {
        return null;
      }
      
      // Extract company name and ticker from combined field
      // Handle various formats: "Company NameTICKER", "Company Name, Inc.TICKER", etc.
      let name = '';
      let ticker = '';
      
      // Try to extract ticker from the end
      const tickerMatch = nameAndTicker.match(/([A-Z]{2,8}(?:\.[A-Z]{1,3})?)$/);
      if (tickerMatch) {
        ticker = tickerMatch[1];
        name = nameAndTicker.replace(ticker, '').trim();
        
        // Clean up name - remove trailing punctuation and common suffixes
        name = name.replace(/,?\s*(Inc\.?|Corp\.?|Ltd\.?|LLC|PLC|SE|AG|AB|AS|Group|Holdings?)$/i, '');
        name = name.replace(/,$/, '').trim();
      } else {
        // If no clear ticker pattern, use the whole field as name
        name = nameAndTicker.trim();
        ticker = 'UNKNOWN';
      }
      
      // Extract country from flag emoji
      const country = this.extractCountryFromFlag(countryFlag);
      
      // Default shares outstanding (will be updated by stock price service)
      const shares_outstanding = 1000000; // Default 1M shares
      
      return {
        name,
        ticker,
        btc_holdings,
        country,
        exchange: this.guessExchange(ticker, country),
        shares_outstanding
      };
      
    } catch (error) {
      logger.warn('Error parsing CSV line:', line, error);
      return null;
    }
  }
  
  private static parseCSVFields(line: string): string[] {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      
      if (char === '"' && !inQuotes) {
        inQuotes = true;
      } else if (char === '"' && inQuotes) {
        inQuotes = false;
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
      
      i++;
    }
    
    if (current) {
      fields.push(current.trim());
    }
    
    return fields;
  }
  
  private static extractCountryFromFlag(flag: string): string {
    const flagMap: { [key: string]: string } = {
      '🇺🇸': 'US',
      '🇨🇦': 'CA',
      '🇯🇵': 'JP',
      '🇩🇪': 'DE',
      '🇬🇧': 'GB',
      '🇫🇷': 'FR',
      '🇨🇳': 'CN',
      '🇭🇰': 'HK',
      '🇸🇬': 'SG',
      '🇦🇺': 'AU',
      '🇰🇷': 'KR',
      '🇳🇴': 'NO',
      '🇸🇪': 'SE',
      '🇧🇷': 'BR',
      '🇦🇷': 'AR',
      '🇲🇹': 'MT',
      '🇹🇭': 'TH',
      '🇹🇷': 'TR',
      '🇰🇾': 'KY',
      '🇯🇪': 'JE',
      '🇮🇹': 'IT',
      '🇧🇭': 'BH',
      '🇦🇪': 'AE',
      '🇬🇮': 'GI',
      '🇪🇸': 'ES',
      '🇿🇦': 'ZA',
      '🇮🇳': 'IN'
    };
    
    return flagMap[flag] || 'US';
  }
  
  private static guessExchange(ticker: string, country: string): string {
    // Exchange mapping based on ticker patterns and country
    if (ticker.includes('.T')) return 'TSE';
    if (ticker.includes('.HK')) return 'HKEX';
    if (ticker.includes('.TO')) return 'TSX';
    if (ticker.includes('.V')) return 'TSXV';
    if (ticker.includes('.AX')) return 'ASX';
    if (ticker.includes('.L')) return 'LSE';
    if (ticker.includes('.PA')) return 'Euronext';
    if (ticker.includes('.DE')) return 'XETRA';
    if (ticker.includes('.OL')) return 'OSE';
    if (ticker.includes('.ST')) return 'OMX';
    if (ticker.includes('.BK')) return 'SET';
    if (ticker.includes('.KQ')) return 'KOSDAQ';
    if (ticker.includes('.KS')) return 'KRX';
    if (ticker.includes('.MI')) return 'Borsa Italiana';
    if (ticker.includes('.SA')) return 'B3';
    if (ticker.includes('.JO')) return 'JSE';
    if (ticker.includes('.IS')) return 'BIST';
    if (ticker.includes('.AD')) return 'ADX';
    if (ticker.includes('.BH')) return 'BHB';
    if (ticker.includes('.BO')) return 'BSE';
    if (ticker.includes('.MC')) return 'BME';
    if (ticker.includes('.AQ')) return 'NEX';
    if (ticker.includes('.CN')) return 'CNQ';
    if (ticker.includes('.NE')) return 'NEO';
    if (ticker.includes('.F')) return 'Frankfurt';
    if (ticker.includes('.DU')) return 'Dusseldorf';
    if (ticker.includes('.NGM')) return 'NGM';
    
    // Default based on country
    switch (country) {
      case 'US': return 'NASDAQ';
      case 'CA': return 'TSX';
      case 'JP': return 'TSE';
      case 'GB': return 'LSE';
      case 'DE': return 'XETRA';
      case 'FR': return 'Euronext';
      case 'AU': return 'ASX';
      case 'HK': return 'HKEX';
      case 'SG': return 'SGX';
      case 'KR': return 'KRX';
      case 'NO': return 'OSE';
      case 'SE': return 'OMX';
      case 'BR': return 'B3';
      case 'CN': return 'SSE';
      case 'IN': return 'BSE';
      case 'ZA': return 'JSE';
      case 'TH': return 'SET';
      case 'TR': return 'BIST';
      default: return 'NASDAQ';
    }
  }
}