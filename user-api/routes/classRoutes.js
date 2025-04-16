import express from 'express';
import * as classController from '../controllers/classController.js';
import * as assignmentController from '../controllers/assignmentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Class routes
router.post('/', authenticateToken, classController.createClass);
router.get('/teacher', authenticateToken, classController.getTeacherClasses);
router.get('/:id', authenticateToken, classController.getClassById);
router.get('/:classId/batches', authenticateToken, classController.getClassBatches);
router.get('/:classId/assignments', authenticateToken, assignmentController.getClassAssignments);

export default router;