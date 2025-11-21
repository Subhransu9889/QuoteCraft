import { Router } from 'express';
import approvalController from '../controllers/approval.controller';

const router = Router();

router.post('/', approvalController.submitApproval);

export default router;
