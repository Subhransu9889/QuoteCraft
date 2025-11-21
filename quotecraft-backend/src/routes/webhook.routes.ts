import { Router } from 'express';
import { webhookController } from '../controllers/webhook.controller';

const router = Router();

/**
 * POST /api/webhook/email
 * Handle email attachment webhook
 */
router.post('/email', webhookController.handleEmailWebhook);

/**
 * POST /api/webhook/storage
 * Handle cloud storage upload webhook
 */
router.post('/storage', webhookController.handleStorageWebhook);

/**
 * POST /api/webhook/orchestrate
 * Handle watsonx Orchestrate callback
 */
router.post('/orchestrate', webhookController.handleOrchestrateCallback);

export default router;
