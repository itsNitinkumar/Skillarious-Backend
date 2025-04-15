import express from 'express';
import { authenticateUser } from '../controllers/Auth.js';
import {
  // getStudentDashboard,
  // getStudentProgress
  getEnrolledCourses
} from '../controllers/Student.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateUser as express.RequestHandler);

// // Dashboard routes
// router.get(
//   '/dashboard',
//   getStudentDashboard as unknown as express.RequestHandler
// );

// // Progress routes
// router.get(
//   '/progress/:courseId',
//   getStudentProgress as unknown as express.RequestHandler
// );

router.get(
  '/enrolledCourses',
  getEnrolledCourses as unknown as express.RequestHandler
);

export default router;



