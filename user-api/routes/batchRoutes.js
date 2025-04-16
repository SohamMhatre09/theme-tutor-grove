import express from 'express';
import * as batchController from '../controllers/batchController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Batch routes
router.post('/', authenticateToken, batchController.createBatch);
router.post('/enroll', authenticateToken, batchController.enrollInBatch);
router.get('/enrolled', authenticateToken, batchController.getEnrolledBatches);
router.get('/:id', authenticateToken, batchController.getBatchById);
router.post('/:id/leave', authenticateToken, batchController.leaveBatch);

export default router;