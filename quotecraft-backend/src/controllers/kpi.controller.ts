import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { KPIMetrics } from '../models/types';

class KPIController {
  async getKPIs(req: Request, res: Response): Promise<void> {
    try {
      const kpis: KPIMetrics = {
        totalProcessed: 42,
        avgProcessingTime: '3.5 minutes',
        stpRate: 78.5,
        autoApprovedCount: 33,
        escalatedCount: 9,
        totalCostSavings: 125000.0,
        avgCostVariance: -4.2,
        errorRate: 2.1
      };

      logger.info('KPIs retrieved');

      res.json({
        success: true,
        data: kpis,
        message: 'KPIs retrieved successfully'
      });
    } catch (error: any) {
      logger.error(`KPI error: ${error.message}`);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }
}

export default new KPIController();
