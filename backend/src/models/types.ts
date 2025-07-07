export interface Company {
  id?: number;
  name: string;
  ticker: string;
  exchange?: string;
  country_code?: string;
  btc_holdings: number;
  shares_outstanding?: number;
  last_holdings_update?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StockPrice {
  id?: number;
  ticker: string;
  price: number;
  currency: string;
  timestamp?: string;
}

export interface BitcoinPrice {
  id?: number;
  price: number;
  currency: string;
  timestamp?: string;
}

export interface TreasuryData extends Company {
  stock_price?: number;
  market_cap?: number;
  btc_value?: number;
  nav_per_share?: number;
  premium?: number;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface ScrapedCompany {
  name: string;
  ticker: string;
  btc_holdings: number;
  country?: string;
  exchange?: string;
  shares_outstanding?: number;
}