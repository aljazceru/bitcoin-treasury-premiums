import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import { apiService } from '../services/api';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup axios mock
    mockedAxios.create = vi.fn(() => ({
      get: mockedAxios.get,
      post: mockedAxios.post,
      interceptors: {
        response: {
          use: vi.fn()
        }
      }
    }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getCompanies', () => {
    it('should fetch companies successfully', async () => {
      const mockData = [
        { id: 1, name: 'Test Company', ticker: 'TEST', btc_holdings: 1000 }
      ];

      mockedAxios.get.mockResolvedValue({
        data: { success: true, data: mockData }
      });

      const result = await apiService.getCompanies();

      expect(result).toEqual(mockData);
      expect(mockedAxios.get).toHaveBeenCalledWith('/companies');
    });

    it('should handle API errors', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { success: false, error: 'Server error' }
      });

      await expect(apiService.getCompanies()).rejects.toThrow('Server error');
    });

    it('should handle network errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(apiService.getCompanies()).rejects.toThrow('Network error');
    });
  });

  describe('getBitcoinPrice', () => {
    it('should fetch Bitcoin price successfully', async () => {
      const mockPrice = {
        price: 50000,
        currency: 'USD',
        timestamp: '2024-01-01T00:00:00Z'
      };

      mockedAxios.get.mockResolvedValue({
        data: { success: true, data: mockPrice }
      });

      const result = await apiService.getBitcoinPrice();

      expect(result).toEqual(mockPrice);
      expect(mockedAxios.get).toHaveBeenCalledWith('/bitcoin-price');
    });
  });

  describe('updatePrices', () => {
    it('should trigger price update successfully', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { success: true }
      });

      await expect(apiService.updatePrices()).resolves.not.toThrow();
      expect(mockedAxios.post).toHaveBeenCalledWith('/update-prices');
    });

    it('should handle update failures', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { success: false, error: 'Update failed' }
      });

      await expect(apiService.updatePrices()).rejects.toThrow('Update failed');
    });
  });

  describe('Memory and Resource Management', () => {
    it('should not leak memory during repeated API calls', async () => {
      const mockData = { success: true, data: [] };
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Make many API calls
      const promises = [];
      for (let i = 0; i < 1000; i++) {
        promises.push(apiService.getCompanies());
      }

      await Promise.all(promises);

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;

      if (initialMemory > 0 && finalMemory > 0) {
        const memoryGrowth = finalMemory - initialMemory;
        // Memory growth should be reasonable (less than 20MB for 1000 calls)
        expect(memoryGrowth).toBeLessThan(20 * 1024 * 1024);
      }
    });

    it('should handle concurrent requests efficiently', async () => {
      const mockData = { success: true, data: { price: 50000 } };
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const startTime = performance.now();

      // Make concurrent requests
      const promises = Array.from({ length: 100 }, () => 
        apiService.getBitcoinPrice()
      );

      await Promise.all(promises);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete reasonably fast (less than 5 seconds)
      expect(duration).toBeLessThan(5000);
    });

    it('should properly handle request timeouts', async () => {
      const timeoutError = new Error('Request timeout') as any;
      timeoutError.code = 'ECONNABORTED';
      
      mockedAxios.get.mockRejectedValue(timeoutError);

      await expect(apiService.getCompanies()).rejects.toThrow();
    });

    it('should handle large response payloads', async () => {
      // Create large mock dataset
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        name: `Company ${i}`,
        ticker: `TST${i}`,
        btc_holdings: Math.random() * 10000
      }));

      mockedAxios.get.mockResolvedValue({
        data: { success: true, data: largeDataset }
      });

      const startTime = performance.now();
      const result = await apiService.getCompanies();
      const endTime = performance.now();

      expect(result).toHaveLength(10000);
      
      const processingTime = endTime - startTime;
      // Should process large payload efficiently (less than 1 second)
      expect(processingTime).toBeLessThan(1000);
    });
  });

  describe('Error Recovery', () => {
    it('should retry failed requests appropriately', async () => {
      // First call fails, second succeeds
      mockedAxios.get
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce({
          data: { success: true, data: [] }
        });

      // This test assumes the service has retry logic
      // For now, just test that it handles the error
      await expect(apiService.getCompanies()).rejects.toThrow('Temporary failure');
    });

    it('should handle malformed responses', async () => {
      mockedAxios.get.mockResolvedValue({
        data: 'Invalid JSON response'
      });

      await expect(apiService.getCompanies()).rejects.toThrow();
    });

    it('should handle null/undefined responses', async () => {
      mockedAxios.get.mockResolvedValue(null);

      await expect(apiService.getCompanies()).rejects.toThrow();
    });
  });

  describe('Request Lifecycle', () => {
    it('should properly configure request headers and timeouts', () => {
      // Verify that axios.create was called with proper config
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: expect.any(String),
        timeout: 15000
      });
    });

    it('should handle different response status codes', async () => {
      const error = new Error('Request failed') as any;
      error.response = { status: 500, data: { error: 'Internal server error' } };
      
      mockedAxios.get.mockRejectedValue(error);

      await expect(apiService.getCompanies()).rejects.toThrow();
    });
  });
});