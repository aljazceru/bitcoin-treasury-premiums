import { NextApiRequest, NextApiResponse } from 'next';
import { companyService } from '../../../services/companyService';
import { bitcoinPriceService } from '../../../services/bitcoinPriceService';
import { stockPriceService } from '../../../services/stockPriceService';
import { APIResponse } from '../../../models/types';
import { logger } from '../../../utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { ticker } = req.query;
    
    // Input validation
    if (!ticker || typeof ticker !== 'string' || ticker.trim().length === 0) {
      const response: APIResponse<any> = {
        success: false,
        error: 'Invalid ticker symbol',
        timestamp: new Date().toISOString()
      };
      res.status(400).json(response);
      return;
    }

    const normalizedTicker = ticker.trim().toUpperCase();
    if (normalizedTicker.length > 10) {
      const response: APIResponse<any> = {
        success: false,
        error: 'Ticker symbol too long',
        timestamp: new Date().toISOString()
      };
      res.status(400).json(response);
      return;
    }

    const company = await companyService.getCompanyByTicker(normalizedTicker);
    
    if (!company) {
      const response: APIResponse<any> = {
        success: false,
        error: 'Company not found',
        timestamp: new Date().toISOString()
      };
      res.status(404).json(response);
      return;
    }

    // Get latest stock price
    const stockPrice = await stockPriceService.getLastPrice(normalizedTicker);
    const btcPrice = await bitcoinPriceService.getLastPrice();

    const response: APIResponse<any> = {
      success: true,
      data: {
        ...company,
        stock_price: stockPrice?.price,
        bitcoin_price: btcPrice?.price
      },
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Error getting company:', error);
    const response: APIResponse<any> = {
      success: false,
      error: 'Failed to fetch company',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
}