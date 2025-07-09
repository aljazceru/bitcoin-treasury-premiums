import { NextApiRequest, NextApiResponse } from 'next';
import { bitcoinPriceService } from '../../services/bitcoinPriceService';
import { stockPriceService } from '../../services/stockPriceService';
import { APIResponse } from '../../models/types';
import { logger } from '../../utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Manual trigger for price updates
    await bitcoinPriceService.updatePrice();
    
    if (stockPriceService.isMarketOpen()) {
      await stockPriceService.updateAllStockPrices();
    }

    const response: APIResponse<any> = {
      success: true,
      data: {
        message: 'Price update triggered',
        marketOpen: stockPriceService.isMarketOpen()
      },
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Error updating prices:', error);
    const response: APIResponse<any> = {
      success: false,
      error: 'Failed to update prices',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
}