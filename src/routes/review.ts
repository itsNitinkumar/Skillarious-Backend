import { Router } from 'express';
import { createReview, updateReview, deleteReview, getAverageRating, getCourseReviews } from '../controllers/Review.ts';
import { authenticateUser } from '../controllers/Auth.ts';
import { RequestHandler } from 'express';

const router = Router();

router.post('/create', authenticateUser as unknown as RequestHandler, createReview as unknown as RequestHandler);
router.put('/update/:courseId', authenticateUser as unknown as RequestHandler, updateReview as unknown as RequestHandler);
router.delete('/delete/:courseId', authenticateUser as unknown as RequestHandler, deleteReview as unknown as RequestHandler);
router.get('/averagerating/:courseId', getAverageRating as unknown as RequestHandler);
router.get('/all/:courseId', getCourseReviews as unknown as RequestHandler);

export default router;