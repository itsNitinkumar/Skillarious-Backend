import express from 'express';
import { 
  moderateUser, 
  moderateCourse, 
  moderateModule, 
  moderateContent,
  getUserAnalytics,
  getEngagementAnalytics,
  getRevenueAnalytics,
  getPlatformOverview,
  getReviewAnalytics,
  getEducatorAnalytics,
  inviteAdmin,
  registerAdmin
} from '../controllers/Admin';
import { isAdmin, isSuperAdmin } from '../middleware/adminAuth';
import { validateSchema } from '../middleware/validateSchema';
import { adminActionSchema } from '../schemas/admin';
import { logAdminAction } from '../middleware/adminLogger';

const router = express.Router();

// Moderation Routes
router.post(
  '/moderate/user/:userId/ban',
  isAdmin as express.RequestHandler,
  validateSchema(adminActionSchema) as express.RequestHandler,
  logAdminAction('BAN_USER') as unknown as express.RequestHandler,
  moderateUser.banUser as unknown as express.RequestHandler
);

router.post(
  '/moderate/user/:userId/unban',
  isAdmin as express.RequestHandler,
  validateSchema(adminActionSchema) as express.RequestHandler,
  logAdminAction('UNBAN_USER') as unknown as express.RequestHandler,
  moderateUser.unbanUser as unknown as express.RequestHandler
);

router.post(
  '/moderate/course/:courseId/dismiss',
  isAdmin as express.RequestHandler,
  validateSchema(adminActionSchema) as express.RequestHandler,
  logAdminAction('DISMISS_COURSE') as unknown as express.RequestHandler,
  moderateCourse.dismissCourse as unknown as express.RequestHandler
);

router.post(
  '/moderate/module/:moduleId/dismiss',
  isAdmin as express.RequestHandler,
  validateSchema(adminActionSchema) as express.RequestHandler,
  logAdminAction('DISMISS_MODULE') as unknown as express.RequestHandler,
  moderateModule.dismissModule as unknown as express.RequestHandler
);

router.post(
  '/moderate/content/:contentId/dismiss',
  isAdmin as express.RequestHandler,
  validateSchema(adminActionSchema) as express.RequestHandler,
  logAdminAction('DISMISS_CONTENT') as unknown as express.RequestHandler,
  moderateContent.dismissContent as unknown as express.RequestHandler
);

// Analytics Routes
router.get(
  '/analytics/users',
  isAdmin as express.RequestHandler,
  getUserAnalytics as unknown as express.RequestHandler
);

router.get(
  '/analytics/engagement',
  isAdmin as express.RequestHandler,
  getEngagementAnalytics as unknown as express.RequestHandler
);

router.get(
  '/analytics/revenue',
  isAdmin as express.RequestHandler,
  getRevenueAnalytics as unknown as express.RequestHandler
);

router.get(
  '/analytics/platform-overview',
  isAdmin as express.RequestHandler,
  getPlatformOverview as unknown as express.RequestHandler
);

router.get(
  '/analytics/reviews',
  isAdmin as express.RequestHandler,
  getReviewAnalytics as unknown as express.RequestHandler
);

router.get(
  '/analytics/educators',
  isAdmin as express.RequestHandler,
  getEducatorAnalytics as unknown as express.RequestHandler
);

// Admin Management Routes
router.post(
  '/invite',
  isAdmin as express.RequestHandler,
  isSuperAdmin as express.RequestHandler,
  inviteAdmin as express.RequestHandler
);

router.post('/register', registerAdmin as express.RequestHandler);

export default router;








