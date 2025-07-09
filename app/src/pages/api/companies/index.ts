import { NextApiRequest, NextApiResponse } from 'next';
import { companyService } from '../../../services/companyService';
import { APIResponse } from '../../../models/types';
import { logger } from '../../../utils/logger';
import { initializeApp } from '../../../lib/startup';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Initialize app if not already done
    await initializeApp();
    
    const companies = await companyService.getTreasuryData();
    
    const response: APIResponse<any> = {
      success: true,
      data: companies,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Error getting companies:', error);
    const response: APIResponse<any> = {
      success: false,
      error: 'Failed to fetch companies',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
}