import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import documentParserService from '../services/document-parser.service';
import watsonxService from '../services/watsonx-orchestrate.service';
import { logger } from '../utils/logger';

class UploadController {
  async handleFileUpload(req: Request, res: Response): Promise<void> {
    try {
      const { fileType, vendorName, vendorId } = req.body;

      if (!req.file) {
        res.status(400).json({
          success: false,
          error: { message: 'No file provided' }
        });
        return;
      }

      if (!['boq', 'quote'].includes(fileType)) {
        res.status(400).json({
          success: false,
          error: { message: 'Invalid fileType' }
        });
        return;
      }

      const fileId = `${fileType}-${uuidv4()}`;
      const fileName = req.file.originalname;

      const parsedData = await documentParserService.parseDocument(
        req.file.buffer,
        fileType as 'boq' | 'quote'
      );

      const flowResult = await watsonxService.triggerExtractionFlow({
        fileId,
        fileName,
        fileType,
        s3Path: `s3://bucket/${fileType}s/${fileId}-${fileName}`
      });

      logger.info(`File uploaded: ${fileName} (ID: ${fileId})`);

      res.json({
        success: true,
        data: {
          fileId,
          fileName,
          fileType,
          parsedData,
          flowExecutionId: flowResult.flowExecutionId,
          status: flowResult.status
        },
        message: 'File uploaded and parsed successfully'
      });
    } catch (error: any) {
      logger.error(`Upload error: ${error.message}`);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Upload failed' }
      });
    }
  }
}

export default new UploadController();
