import { logger } from '../utils/logger';
import documentParserService from './document-parser.service';
import { BOQ, Quote } from '../models/types';

/**
 * Webhook Handler Service
 * Handles incoming webhooks from external systems (email, storage, etc.)
 */
class WebhookHandlerService {
  /**
   * Handle email attachment webhook
   * Triggered when email with BOQ/quote attachment is received
   */
  async handleEmailAttachment(payload: {
    from: string;
    subject: string;
    attachments: Array<{
      filename: string;
      content: Buffer;
      contentType: string;
    }>;
  }): Promise<{ success: boolean; processedFiles: number }> {
    try {
      logger.info(`Processing email webhook from: ${payload.from}`);

      let processedFiles = 0;

      for (const attachment of payload.attachments) {
        // Determine file type from filename or subject
        const fileType = this.determineFileType(attachment.filename, payload.subject);

        if (fileType) {
          // Parse the attachment
          const parsedData = await documentParserService.parseDocument(
            attachment.content,
            fileType
          );

          logger.info(`Parsed ${fileType} from email: ${attachment.filename}`);
          processedFiles++;

          // TODO: Store parsed data and trigger comparison flow
          // This would integrate with watsonx Orchestrate
        }
      }

      return { success: true, processedFiles };
    } catch (error: any) {
      logger.error('Email webhook processing failed:', error);
      throw new Error(`Email webhook processing failed: ${error.message}`);
    }
  }

  /**
   * Handle cloud storage webhook
   * Triggered when file is uploaded to cloud storage bucket
   */
  async handleStorageUpload(payload: {
    bucketName: string;
    fileName: string;
    fileUrl: string;
    metadata?: Record<string, string>;
  }): Promise<{ success: boolean; fileId: string }> {
    try {
      logger.info(`Processing storage webhook for file: ${payload.fileName}`);

      // Determine file type from metadata or filename
      const fileType = payload.metadata?.fileType || 
                      this.determineFileType(payload.fileName, '');

      if (!fileType) {
        throw new Error('Unable to determine file type');
      }

      // Download and parse file
      // In production, this would fetch from S3/Cloud Storage
      logger.info(`File type determined: ${fileType}`);

      const fileId = `file-${Date.now()}`;

      return { success: true, fileId };
    } catch (error: any) {
      logger.error('Storage webhook processing failed:', error);
      throw new Error(`Storage webhook processing failed: ${error.message}`);
    }
  }

  /**
   * Handle watsonx Orchestrate callback
   * Triggered when Orchestrate flow completes
   */
  async handleOrchestrateCallback(payload: {
    flowId: string;
    status: 'completed' | 'failed' | 'pending';
    result?: any;
    error?: string;
  }): Promise<{ success: boolean }> {
    try {
      logger.info(`Processing Orchestrate callback for flow: ${payload.flowId}`);

      if (payload.status === 'completed') {
        logger.info(`Flow ${payload.flowId} completed successfully`);
        // Update comparison status, send notifications, etc.
      } else if (payload.status === 'failed') {
        logger.error(`Flow ${payload.flowId} failed: ${payload.error}`);
        // Handle failure, notify user, retry logic, etc.
      }

      return { success: true };
    } catch (error: any) {
      logger.error('Orchestrate callback processing failed:', error);
      throw new Error(`Orchestrate callback processing failed: ${error.message}`);
    }
  }

  /**
   * Determine file type from filename and context
   */
  private determineFileType(filename: string, context: string): 'boq' | 'quote' | null {
    const lowerFilename = filename.toLowerCase();
    const lowerContext = context.toLowerCase();

    // Check filename
    if (lowerFilename.includes('boq') || lowerFilename.includes('bill-of-quantities')) {
      return 'boq';
    }
    if (lowerFilename.includes('quote') || lowerFilename.includes('quotation')) {
      return 'quote';
    }

    // Check context (email subject, etc.)
    if (lowerContext.includes('boq') || lowerContext.includes('bill of quantities')) {
      return 'boq';
    }
    if (lowerContext.includes('quote') || lowerContext.includes('quotation')) {
      return 'quote';
    }

    return null;
  }
}

export const webhookHandlerService = new WebhookHandlerService();
