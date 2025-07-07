import { Request, Response } from 'express';
import { companyService } from '../services/companyService';
import { bitcoinPriceService } from '../services/bitcoinPriceService';
import { stockPriceService } from '../services/stockPriceService';
import { APIResponse } from '../models/types';
import { logger } from '../utils/logger';

export class ApiController {
  async getCompanies(_req: Request, res: Response): Promise<void> {
    try {
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

  async getCompany(req: Request, res: Response): Promise<void> {
    try {
      const { ticker } = req.params;
      
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

  async getBitcoinPrice(_req: Request, res: Response): Promise<void> {
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

  async getPriceHistory(req: Request, res: Response): Promise<void> {
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

  async updatePrices(_req: Request, res: Response): Promise<void> {
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

  async getMarketStatus(_req: Request, res: Response): Promise<void> {
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
}

export const apiController = new ApiController();