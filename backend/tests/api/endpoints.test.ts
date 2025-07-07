import request from 'supertest';
import { createApp } from '../../src/app';
import { db } from '../../src/models/database';
import { Application } from 'express';

describe('API Endpoints', () => {
  let app: Application;

  beforeEach(async () => {
    app = createApp();
    
    // Insert test data
    await db.run(
      'INSERT INTO companies (name, ticker, btc_holdings, shares_outstanding) VALUES (?, ?, ?, ?)',
      ['MicroStrategy', 'MSTR', 190000, 15.5]
    );
    
    await db.run(
      'INSERT INTO bitcoin_prices (price, currency) VALUES (?, ?)',
      [45000, 'USD']
    );
    
    await db.run(
      'INSERT INTO stock_prices (ticker, price, currency) VALUES (?, ?, ?)',
      ['MSTR', 250.50, 'USD']
    );
  });

  describe('GET /api/companies', () => {
    it('should return list of companies with treasury data', async () => {
      const response = await request(app)
        .get('/api/companies')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('MicroStrategy');
      expect(response.body.data[0].ticker).toBe('MSTR');
      expect(response.body.data[0].stock_price).toBe(250.50);
    });
  });

  describe('GET /api/companies/:ticker', () => {
    it('should return company data for valid ticker', async () => {
      const response = await request(app)
        .get('/api/companies/MSTR')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('MicroStrategy');
      expect(response.body.data.ticker).toBe('MSTR');
    });

    it('should return 404 for invalid ticker', async () => {
      const response = await request(app)
        .get('/api/companies/INVALID')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Company not found');
    });
  });

  describe('GET /api/bitcoin-price', () => {
    it('should return current Bitcoin price', async () => {
      const response = await request(app)
        .get('/api/bitcoin-price')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.price).toBe(45000);
      expect(response.body.data.currency).toBe('USD');
    });
  });

  describe('GET /api/market-status', () => {
    it('should return market status', async () => {
      const response = await request(app)
        .get('/api/market-status')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('marketOpen');
      expect(response.body.data).toHaveProperty('message');
    });
  });

  describe('GET /health', () => {
    it('should return health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Memory Leak Tests', () => {
    it('should not accumulate memory during repeated API calls', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Make many API requests
      const requests = [];
      for (let i = 0; i < 500; i++) {
        requests.push(
          request(app).get('/api/companies').expect(200),
          request(app).get('/api/bitcoin-price').expect(200),
          request(app).get('/api/market-status').expect(200),
          request(app).get('/health').expect(200)
        );
      }

      await Promise.all(requests);

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = finalMemory - initialMemory;

      // Memory growth should be reasonable (less than 50MB for 2000 requests)
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
    });

    it('should handle concurrent requests without memory leaks', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Create many concurrent requests
      const concurrentRequests = Array.from({ length: 100 }, () => [
        request(app).get('/api/companies'),
        request(app).get('/api/bitcoin-price'),
        request(app).get('/api/market-status')
      ]).flat();

      await Promise.all(concurrentRequests);

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = finalMemory - initialMemory;

      // Should handle concurrent requests efficiently
      expect(memoryGrowth).toBeLessThan(30 * 1024 * 1024);
    });

    it('should handle large response payloads efficiently', async () => {
      // Add many companies to test large payloads
      for (let i = 0; i < 100; i++) {
        await db.run(
          'INSERT INTO companies (name, ticker, btc_holdings, shares_outstanding) VALUES (?, ?, ?, ?)',
          [`Company ${i}`, `TST${i}`, Math.random() * 10000, Math.random() * 1000]
        );
        await db.run(
          'INSERT INTO stock_prices (ticker, price, currency) VALUES (?, ?, ?)',
          [`TST${i}`, Math.random() * 1000, 'USD']
        );
      }

      const initialMemory = process.memoryUsage().heapUsed;

      // Request large payload multiple times
      for (let i = 0; i < 50; i++) {
        await request(app).get('/api/companies').expect(200);
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = finalMemory - initialMemory;

      // Should handle large payloads without excessive memory growth
      expect(memoryGrowth).toBeLessThan(25 * 1024 * 1024);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Close database to simulate connection error
      await db.close();

      const response = await request(app)
        .get('/api/companies')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();

      // Reinitialize for other tests
      await db.initialize();
    });

    it('should handle malformed requests', async () => {
      const response = await request(app)
        .get('/api/companies/../../etc/passwd')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});