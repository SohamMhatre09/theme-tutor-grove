import express from 'express';
import * as assignmentController from '../controllers/assignmentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Assignment routes
router.post('/', authenticateToken, assignmentController.createAssignment);
router.get('/:id', authenticateToken, assignmentController.getAssignmentById);
router.post('/:id/submit', authenticateToken, assignmentController.submitAssignment);
router.post('/:id/modules/:moduleId/complete', authenticateToken, assignmentController.completeModule);
router.get('/:id/completed-modules', authenticateToken, assignmentController.getCompletedModules);

// Student assignments route
router.get('/assignments', authenticateToken, assignmentController.getStudentAssignments);

export default router;