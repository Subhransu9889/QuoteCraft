import { Router } from 'express';
import multer from 'multer';
import uploadController from '../controllers/upload.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.post('/', upload.single('file'), uploadController.handleFileUpload);

export default router;
