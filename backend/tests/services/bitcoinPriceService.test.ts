import { bitcoinPriceService } from '../../src/services/bitcoinPriceService';
import { db } from '../../src/models/database';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('BitcoinPriceService', () => {
  describe('fetchCurrentPrice', () => {
    it('should fetch Bitcoin price from CoinGecko API', async () => {
      const mockPrice = 45000;
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          bitcoin: {
            usd: mockPrice
          }
        }
      });

      const price = await bitcoinPriceService.fetchCurrentPrice();
      
      expect(price).toBe(mockPrice);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/simple/price'),
        expect.objectContaining({
          params: {
            ids: 'bitcoin',
            vs_currencies: 'usd'
          }
        })
      );
    });

    it('should handle API errors and return last known price', async () => {
      // Insert a known price
      await db.run(
        'INSERT INTO bitcoin_prices (price, currency) VALUES (?, ?)',
        [40000, 'USD']
      );

      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      const price = await bitcoinPriceService.fetchCurrentPrice();
      
      expect(price).toBe(40000);
    });
  });

  describe('updatePrice', () => {
    it('should fetch and store Bitcoin price', async () => {
      const mockPrice = 50000;
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          bitcoin: {
            usd: mockPrice
          }
        }
      });

      const result = await bitcoinPriceService.updatePrice();
      
      expect(result.price).toBe(mockPrice);
      expect(result.currency).toBe('USD');

      // Verify it was stored in database
      const stored = await db.get<any>(
        'SELECT * FROM bitcoin_prices ORDER BY timestamp DESC LIMIT 1'
      );
      expect(stored.price).toBe(mockPrice);
    });
  });

  describe('getPriceHistory', () => {
    it('should return price history for specified hours', async () => {
      // Insert test data using SQLite datetime format
      const prices = [
        { price: 45000, timestamp: "datetime('now', '-1 hour')" },
        { price: 46000, timestamp: "datetime('now', '-2 hour')" },
        { price: 47000, timestamp: "datetime('now', '-25 hour')" } // Outside 24h
      ];

      for (const p of prices) {
        await db.run(
          `INSERT INTO bitcoin_prices (price, currency, timestamp) VALUES (?, ?, ${p.timestamp})`,
          [p.price, 'USD']
        );
      }

      const history = await bitcoinPriceService.getPriceHistory(24);
      
      expect(history.length).toBe(2); // Only prices within 24 hours
      expect(history[0].price).toBe(45000);
      expect(history[1].price).toBe(46000);
    });
  });
});