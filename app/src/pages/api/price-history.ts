import { NextApiRequest, NextApiResponse } from 'next';
import { bitcoinPriceService } from '../../services/bitcoinPriceService';
import { APIResponse } from '../../models/types';
import { logger } from '../../utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { hours = '24' } = req.query;
    const hoursNum = parseInt(hours as string);
    
    // Input validation
    if (isNaN(hoursNum) || hoursNum < 1 || hoursNum > 8760) { // Max 1 year
      const response: APIResponse<any> = {
        success: false,
        error: 'Invalid hours parameter. Must be between 1 and 8760',
        timestamp: new Date().toISOString()
      };
      res.status(400).json(response);
      return;
    }
    
    const btcHistory = await bitcoinPriceService.getPriceHistory(hoursNum);
    
    const response: APIResponse<any> = {
      success: true,
      data: {
        bitcoin: btcHistory
      },
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Error getting price history:', error);
    const response: APIResponse<any> = {
      success: false,
      error: 'Failed to fetch price history',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
}