import axios from 'axios';

// Use relative URL for API calls since we're using Next.js API routes
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timeout - please try again'));
    }
    if (!error.response) {
      return Promise.reject(new Error('Network error - please check your connection'));
    }
    return Promise.reject(error);
  }
);

export interface Company {
  id?: number;
  name: string;
  ticker: string;
  exchange?: string;
  country_code?: string;
  btc_holdings: number;
  shares_outstanding?: number;
  stock_price?: number;
  market_cap?: number;
  btc_value?: number;
  btc_nav_multiple?: number;        // Market cap divided by value of BTC holdings
  btc_per_share?: number;           // BTC holdings divided by shares outstanding  
  btc_holdings_percentage?: number; // BTC holdings as a percentage of market cap
  last_holdings_update?: string;
}

export interface BitcoinPrice {
  price: number;
  currency: string;
  timestamp: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export const apiService = {
  async getCompanies(): Promise<Company[]> {
    const response = await api.get<APIResponse<Company[]>>('/companies');
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch companies');
    }
    return response.data.data || [];
  },

  async getCompany(ticker: string): Promise<Company> {
    const response = await api.get<APIResponse<Company>>(`/companies/${ticker}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch company');
    }
    return response.data.data!;
  },

  async getBitcoinPrice(): Promise<BitcoinPrice> {
    const response = await api.get<APIResponse<BitcoinPrice>>('/bitcoin-price');
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch Bitcoin price');
    }
    return response.data.data!;
  },

  async getMarketStatus(): Promise<{ marketOpen: boolean; message: string }> {
    const response = await api.get<APIResponse<{ marketOpen: boolean; message: string }>>('/market-status');
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch market status');
    }
    return response.data.data!;
  },

  async updatePrices(): Promise<void> {
    const response = await api.post<APIResponse<any>>('/update-prices');
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to update prices');
    }
  },

  async getPriceHistory(hours: number = 24): Promise<{ bitcoin: BitcoinPrice[] }> {
    const response = await api.get<APIResponse<{ bitcoin: BitcoinPrice[] }>>(`/price-history?hours=${hours}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch price history');
    }
    return response.data.data!;
  }
};

export default apiService;