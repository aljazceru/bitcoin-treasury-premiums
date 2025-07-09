import { NextApiRequest, NextApiResponse } from 'next';
import { stockPriceService } from '../../services/stockPriceService';
import { APIResponse } from '../../models/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const isOpen = stockPriceService.isMarketOpen();
  
  const response: APIResponse<any> = {
    success: true,
    data: {
      marketOpen: isOpen,
      message: isOpen ? 'US stock market is open' : 'US stock market is closed'
    },
    timestamp: new Date().toISOString()
  };
  
  res.json(response);
}