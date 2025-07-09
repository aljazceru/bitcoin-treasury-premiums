import { NextApiRequest, NextApiResponse } from 'next';
import { bitcoinPriceService } from '../../services/bitcoinPriceService';
import { APIResponse } from '../../models/types';
import { logger } from '../../utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const price = await bitcoinPriceService.getLastPrice();
    
    if (!price) {
      const response: APIResponse<any> = {
        success: false,
        error: 'No Bitcoin price available',
        timestamp: new Date().toISOString()
      };
      res.status(404).json(response);
      return;
    }

    const response: APIResponse<any> = {
      success: true,
      data: price,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Error getting Bitcoin price:', error);
    const response: APIResponse<any> = {
      success: false,
      error: 'Failed to fetch Bitcoin price',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
}