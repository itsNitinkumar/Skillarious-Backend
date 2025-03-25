import express from 'express';
import { authenticateUser } from '../middleware/adminAuth';
import {
  getStudentDashboard,
  getStudentProgress
} from '../controllers/Student';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateUser as express.RequestHandler);

// Dashboard routes
router.get(
  '/dashboard',
  getStudentDashboard as express.RequestHandler
);

// Progress routes
router.get(
  '/progress/:courseId',
  getStudentProgress as express.RequestHandler
);

export default router;