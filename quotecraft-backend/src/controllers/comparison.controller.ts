import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import vendorMatcherService from '../services/vendor-matcher.service';
import policyEngineService from '../services/policy-engine.service';
import watsonxService from '../services/watsonx-orchestrate.service';
import notificationService from '../services/notification.service';
import { logger } from '../utils/logger';
import { BOQ, Quote, VendorScore } from '../models/types';

const comparisonStore = new Map();

class ComparisonController {
  async createComparison(req: Request, res: Response): Promise<void> {
    try {
      const { boqData, quotes } = req.body;

      if (!boqData || !quotes || !Array.isArray(quotes)) {
        res.status(400).json({
          success: false,
          error: { message: 'Invalid request: boqData and quotes array required' }
        });
        return;
      }

      const comparisonId = `comp-${uuidv4()}`;
      const vendorScores: VendorScore[] = [];

      for (const quote of quotes) {
        const { matches, unmatched } = vendorMatcherService.matchItems(
          boqData.items,
          quote.items
        );

        const totalCost = quote.totalCost;
        const variance = ((totalCost - boqData.totalBOQ) / boqData.totalBOQ) * 100;
        const complianceScore = unmatched.length === 0 ? 100 : 80;
        const score = 100 - Math.abs(variance) * 0.5 + complianceScore * 0.2;

        vendorScores.push({
          vendorId: quote.vendorId,
          vendorName: quote.vendorName,
          totalCost,
          variance,
          complianceScore,
          deliveryDays: quote.items[0]?.leadTime || 14,
          score,
          recommendation: score > 85 ? 'RECOMMENDED' : score > 70 ? 'ACCEPTABLE' : 'FLAG_REVIEW'
        });
      }

      vendorScores.sort((a, b) => b.score - a.score);
      const bestVendor = vendorScores[0]?.vendorName || 'N/A';
      const costSavings = boqData.totalBOQ - (vendorScores[0]?.totalCost || 0);

      const policyEval = policyEngineService.evaluatePolicies(
        vendorScores[0]?.totalCost || 0,
        quotes.length,
        0,
        vendorScores[0]?.variance || 0
      );

      const approvalRoute = policyEngineService.determineApprovalRoute(
        vendorScores[0]?.totalCost || 0,
        !policyEval.policyChecksPassed
      );

      const comparisonResult = {
        id: comparisonId,
        boqId: boqData.id,
        quotes: vendorScores,
        bestVendor,
        costSavings,
        approvalRoute,
        status: 'PENDING_APPROVAL',
        createdAt: new Date().toISOString(),
        policyEvaluation: policyEval
      };

      comparisonStore.set(comparisonId, comparisonResult);

      await watsonxService.triggerComparisonFlow(boqData, quotes);
      await notificationService.sendSlackNotification(comparisonResult, 'approver@company.com');

      logger.info(`Comparison created: ${comparisonId}`);

      res.json({
        success: true,
        data: comparisonResult,
        message: 'Comparison created successfully'
      });
    } catch (error: any) {
      logger.error(`Comparison error: ${error.message}`);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Comparison failed' }
      });
    }
  }

  async getComparison(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const comparison = comparisonStore.get(id);

      if (!comparison) {
        res.status(404).json({
          success: false,
          error: { message: 'Comparison not found' }
        });
        return;
      }

      res.json({
        success: true,
        data: comparison
      });
    } catch (error: any) {
      logger.error(`Get comparison error: ${error.message}`);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }
}

export default new ComparisonController();
