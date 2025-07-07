import { stockPriceService } from '../../src/services/stockPriceService';
import { db } from '../../src/models/database';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('StockPriceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchStockPrice', () => {
    it('should fetch stock price from Yahoo Finance API', async () => {
      const mockPrice = 250.50;
      const mockShares = 1000000000;
      
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          chart: {
            result: [{
              meta: {
                regularMarketPrice: mockPrice,
                sharesOutstanding: mockShares
              }
            }]
          }
        }
      });

      const result = await stockPriceService.fetchStockPrice('AAPL');
      
      expect(result.price).toBe(mockPrice);
      expect(result.sharesOutstanding).toBe(mockShares);
    });

    it('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(stockPriceService.fetchStockPrice('AAPL')).rejects.toThrow();
    });
  });

  describe('updateStockPrice', () => {
    it('should fetch and store stock price', async () => {
      // Insert test company
      await db.run(
        'INSERT INTO companies (name, ticker, btc_holdings) VALUES (?, ?, ?)',
        ['Apple Inc', 'AAPL', 1000]
      );

      const mockPrice = 150.25;
      const mockShares = 15000000000;
      
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          chart: {
            result: [{
              meta: {
                regularMarketPrice: mockPrice,
                sharesOutstanding: mockShares
              }
            }]
          }
        }
      });

      const result = await stockPriceService.updateStockPrice('AAPL');
      
      expect(result.price).toBe(mockPrice);
      expect(result.ticker).toBe('AAPL');

      // Verify it was stored
      const stored = await db.get<any>(
        'SELECT * FROM stock_prices WHERE ticker = ? ORDER BY timestamp DESC LIMIT 1',
        ['AAPL']
      );
      expect(stored.price).toBe(mockPrice);

      // Verify shares outstanding was updated
      const company = await db.get<any>(
        'SELECT * FROM companies WHERE ticker = ?',
        ['AAPL']
      );
      expect(company.shares_outstanding).toBe(mockShares / 1000000); // Converted to millions
    });
  });

  describe('isMarketOpen', () => {
    it('should return boolean for market status', () => {
      // This test just ensures the function runs without error
      const isOpen = stockPriceService.isMarketOpen();
      expect(typeof isOpen).toBe('boolean');
    });
  });
});