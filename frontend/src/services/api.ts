import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

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
  nav_per_share?: number;
  premium?: number;
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