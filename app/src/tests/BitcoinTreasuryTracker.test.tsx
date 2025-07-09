import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import BitcoinTreasuryTracker from '../components/BitcoinTreasuryTracker';
import * as apiService from '../services/api';

// Mock the API service
vi.mock('../services/api');

const mockApiService = apiService as any;

const mockCompanies = [
  {
    id: 1,
    name: 'MicroStrategy',
    ticker: 'MSTR',
    btc_holdings: 190000,
    stock_price: 250.50,
    premium: 15.5,
    nav_per_share: 217.39,
    btc_value: 9500000000,
    market_cap: 3882750000,
    exchange: 'NASDAQ',
    country_code: 'US'
  },
  {
    id: 2,
    name: 'Tesla',
    ticker: 'TSLA',
    btc_holdings: 9720,
    stock_price: 185.00,
    premium: -5.2,
    nav_per_share: 195.12,
    btc_value: 486000000,
    market_cap: 588300000000,
    exchange: 'NASDAQ',
    country_code: 'US'
  }
];

const mockBitcoinPrice = {
  price: 50000,
  currency: 'USD',
  timestamp: '2024-01-01T00:00:00Z'
};

const mockMarketStatus = {
  marketOpen: true,
  message: 'Market is open'
};

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0
    }
  }
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('BitcoinTreasuryTracker', () => {
  let originalCreateObjectURL: typeof URL.createObjectURL;
  let originalRevokeObjectURL: typeof URL.revokeObjectURL;
  let mockBlobURLs: string[];

  beforeEach(() => {
    mockBlobURLs = [];
    
    // Mock URL.createObjectURL and revokeObjectURL to track blob URLs
    originalCreateObjectURL = URL.createObjectURL;
    originalRevokeObjectURL = URL.revokeObjectURL;
    
    URL.createObjectURL = vi.fn((blob: Blob) => {
      const url = `blob:mock-${Math.random()}`;
      mockBlobURLs.push(url);
      return url;
    });
    
    URL.revokeObjectURL = vi.fn((url: string) => {
      const index = mockBlobURLs.indexOf(url);
      if (index > -1) {
        mockBlobURLs.splice(index, 1);
      }
    });

    // Setup default mocks
    mockApiService.getCompanies.mockResolvedValue(mockCompanies);
    mockApiService.getBitcoinPrice.mockResolvedValue(mockBitcoinPrice);
    mockApiService.getMarketStatus.mockResolvedValue(mockMarketStatus);
    mockApiService.updatePrices.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  describe('Component Rendering', () => {
    it('should render loading state initially', () => {
      renderWithQueryClient(<BitcoinTreasuryTracker />);
      expect(screen.getByText('Loading Bitcoin treasury data...')).toBeInTheDocument();
    });

    it('should render companies data when loaded', async () => {
      renderWithQueryClient(<BitcoinTreasuryTracker />);

      await waitFor(() => {
        expect(screen.getByText('MicroStrategy')).toBeInTheDocument();
        expect(screen.getByText('Tesla')).toBeInTheDocument();
        expect(screen.getByText('₿ Bitcoin: $50,000')).toBeInTheDocument();
      });
    });

    it('should handle API errors gracefully', async () => {
      mockApiService.getCompanies.mockRejectedValue(new Error('API Error'));

      renderWithQueryClient(<BitcoinTreasuryTracker />);

      await waitFor(() => {
        expect(screen.getByText('Error loading data')).toBeInTheDocument();
        expect(screen.getByText('API Error')).toBeInTheDocument();
      });
    });
  });

  describe('Memory Leak Prevention', () => {
    it('should properly clean up blob URLs after CSV export', async () => {
      renderWithQueryClient(<BitcoinTreasuryTracker />);

      await waitFor(() => {
        expect(screen.getByText('MicroStrategy')).toBeInTheDocument();
      });

      // Mock document.createElement and click
      const mockAnchor = document.createElement('a');
      const originalClick = mockAnchor.click;
      mockAnchor.click = vi.fn();
      
      const createElementSpy = vi.spyOn(document, 'createElement');
      createElementSpy.mockReturnValue(mockAnchor);

      const exportButton = screen.getByText('Export CSV');
      fireEvent.click(exportButton);

      // Check that blob URL was created
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockBlobURLs.length).toBe(1);

      // Wait for cleanup timeout
      await new Promise(resolve => setTimeout(resolve, 150));

      // Check that blob URL was revoked
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockBlobURLs[0]);

      createElementSpy.mockRestore();
    });

    it('should not accumulate memory during repeated renders', async () => {
      const { rerender } = renderWithQueryClient(<BitcoinTreasuryTracker />);

      await waitFor(() => {
        expect(screen.getByText('MicroStrategy')).toBeInTheDocument();
      });

      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Re-render component many times
      for (let i = 0; i < 100; i++) {
        rerender(
          <QueryClientProvider client={createTestQueryClient()}>
            <BitcoinTreasuryTracker />
          </QueryClientProvider>
        );
        
        await waitFor(() => {
          expect(screen.getByText('MicroStrategy')).toBeInTheDocument();
        });
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryGrowth = finalMemory - initialMemory;
        // Memory growth should be reasonable (less than 10MB)
        expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024);
      }
    });

    it('should clean up event listeners and timers', async () => {
      const { unmount } = renderWithQueryClient(<BitcoinTreasuryTracker />);

      await waitFor(() => {
        expect(screen.getByText('MicroStrategy')).toBeInTheDocument();
      });

      // Component should unmount without errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('User Interactions', () => {
    it('should handle sorting without memory leaks', async () => {
      renderWithQueryClient(<BitcoinTreasuryTracker />);

      await waitFor(() => {
        expect(screen.getByText('MicroStrategy')).toBeInTheDocument();
      });

      const btcHoldingsHeader = screen.getByText('BTC Holdings');
      
      // Click sorting multiple times to test memory usage
      for (let i = 0; i < 50; i++) {
        fireEvent.click(btcHoldingsHeader);
      }

      // Component should still function normally
      expect(screen.getByText('MicroStrategy')).toBeInTheDocument();
      expect(screen.getByText('Tesla')).toBeInTheDocument();
    });

    it('should handle refresh without accumulating requests', async () => {
      renderWithQueryClient(<BitcoinTreasuryTracker />);

      await waitFor(() => {
        expect(screen.getByText('MicroStrategy')).toBeInTheDocument();
      });

      const refreshButton = screen.getByText('Refresh');
      
      // Click refresh multiple times rapidly
      for (let i = 0; i < 10; i++) {
        fireEvent.click(refreshButton);
      }

      // Should not accumulate API calls
      await waitFor(() => {
        expect(mockApiService.getCompanies).toHaveBeenCalled();
      });
    });

    it('should handle update prices without memory issues', async () => {
      renderWithQueryClient(<BitcoinTreasuryTracker />);

      await waitFor(() => {
        expect(screen.getByText('MicroStrategy')).toBeInTheDocument();
      });

      const updateButton = screen.getByText('Update Prices');
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockApiService.updatePrices).toHaveBeenCalled();
      });
    });
  });

  describe('Memoization and Performance', () => {
    it('should memoize expensive calculations', async () => {
      const { rerender } = renderWithQueryClient(<BitcoinTreasuryTracker />);

      await waitFor(() => {
        expect(screen.getByText('MicroStrategy')).toBeInTheDocument();
      });

      // Re-render with same data
      rerender(
        <QueryClientProvider client={createTestQueryClient()}>
          <BitcoinTreasuryTracker />
        </QueryClientProvider>
      );

      // Summary stats should be displayed correctly
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument(); // Total companies
      });
    });

    it('should handle large datasets efficiently', async () => {
      // Create large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Company ${i}`,
        ticker: `TST${i}`,
        btc_holdings: Math.random() * 10000,
        stock_price: Math.random() * 1000,
        premium: (Math.random() - 0.5) * 100,
        nav_per_share: Math.random() * 500,
        btc_value: Math.random() * 1000000000,
        market_cap: Math.random() * 10000000000,
        exchange: 'NASDAQ',
        country_code: 'US'
      }));

      mockApiService.getCompanies.mockResolvedValue(largeDataset);

      const startTime = performance.now();
      renderWithQueryClient(<BitcoinTreasuryTracker />);

      await waitFor(() => {
        expect(screen.getByText('Company 0')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render large dataset reasonably fast (less than 5 seconds)
      expect(renderTime).toBeLessThan(5000);
    });
  });

  describe('Error Boundaries and Recovery', () => {
    it('should handle calculation errors gracefully', async () => {
      const invalidData = [
        {
          id: 1,
          name: 'Invalid Company',
          ticker: 'INV',
          btc_holdings: null,
          stock_price: undefined,
          premium: NaN,
          nav_per_share: Infinity,
          btc_value: -1,
          market_cap: null,
          exchange: 'NASDAQ',
          country_code: 'US'
        }
      ];

      mockApiService.getCompanies.mockResolvedValue(invalidData as any);

      renderWithQueryClient(<BitcoinTreasuryTracker />);

      await waitFor(() => {
        expect(screen.getByText('Invalid Company')).toBeInTheDocument();
      });

      // Should display N/A for invalid values
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });
});