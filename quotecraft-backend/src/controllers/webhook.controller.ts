import { Request, Response } from 'express';
import { webhookHandlerService } from '../services/webhook-handler.service';
import { logger } from '../utils/logger';

/**
 * Webhook Controller
 * Handles incoming webhooks from external systems
 */
class WebhookController {
  /**
   * Handle email attachment webhook
   */
  async handleEmailWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { from, subject, attachments } = req.body;

      if (!from || !attachments || !Array.isArray(attachments)) {
        res.status(400).json({
          success: false,
          error: 'Invalid email webhook payload',
        });
        return;
      }

      const result = await webhookHandlerService.handleEmailAttachment({
        from,
        subject: subject || '',
        attachments,
      });

      logger.info(`Email webhook processed: ${result.processedFiles} files`);

      res.status(200).json({
        success: true,
        message: 'Email webhook processed successfully',
        processedFiles: result.processedFiles,
      });
    } catch (error: any) {
      logger.error('Email webhook error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Email webhook processing failed',
      });
    }
  }

  /**
   * Handle cloud storage upload webhook
   */
  async handleStorageWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { bucketName, fileName, fileUrl, metadata } = req.body;

      if (!bucketName || !fileName || !fileUrl) {
        res.status(400).json({
          success: false,
          error: 'Invalid storage webhook payload',
        });
        return;
      }

      const result = await webhookHandlerService.handleStorageUpload({
        bucketName,
        fileName,
        fileUrl,
        metadata,
      });

      logger.info(`Storage webhook processed: ${result.fileId}`);

      res.status(200).json({
        success: true,
        message: 'Storage webhook processed successfully',
        fileId: result.fileId,
      });
    } catch (error: any) {
      logger.error('Storage webhook error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Storage webhook processing failed',
      });
    }
  }

  /**
   * Handle watsonx Orchestrate callback
   */
  async handleOrchestrateCallback(req: Request, res: Response): Promise<void> {
    try {
      const { flowId, status, result, error } = req.body;

      if (!flowId || !status) {
        res.status(400).json({
          success: false,
          error: 'Invalid Orchestrate callback payload',
        });
        return;
      }

      await webhookHandlerService.handleOrchestrateCallback({
        flowId,
        status,
        result,
        error,
      });

      logger.info(`Orchestrate callback processed: ${flowId} - ${status}`);

      res.status(200).json({
        success: true,
        message: 'Orchestrate callback processed successfully',
      });
    } catch (error: any) {
      logger.error('Orchestrate callback error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Orchestrate callback processing failed',
      });
    }
  }
}

export const webhookController = new WebhookController();
