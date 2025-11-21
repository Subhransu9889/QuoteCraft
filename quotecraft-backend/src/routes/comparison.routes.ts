import { Router } from 'express';
import comparisonController from '../controllers/comparison.controller';

const router = Router();

router.post('/', comparisonController.createComparison);
router.get('/:id', comparisonController.getComparison);

export default router;
