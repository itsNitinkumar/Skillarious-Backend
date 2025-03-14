import express from 'express';
import { RequestHandler } from 'express';
import * as moduleController from '../controllers/Module';
import * as classController from '../controllers/Class';
import * as doubtController from '../controllers/Doubt';
import * as educatorController from '../controllers/Educator';
import { authenticateUser } from '../controllers/Auth';

const router = express.Router();

// Module routes
router.post('/modules', authenticateUser as unknown as RequestHandler, moduleController.createModule as unknown as RequestHandler);

// Class routes
router.post('/classes', authenticateUser as unknown as RequestHandler, classController.createClass as unknown as RequestHandler);
router.get('/classes/:id/stream', authenticateUser as unknown as RequestHandler, classController.getClassStream as unknown as RequestHandler);

// Doubt routes
router.post('/doubts', authenticateUser as unknown as RequestHandler, doubtController.createDoubt as unknown as RequestHandler);
router.post('/doubts/:id/reply', authenticateUser as unknown as RequestHandler, doubtController.replyToDoubt as unknown as RequestHandler);

// Educator routes
router.put('/educator/profile', authenticateUser as unknown as RequestHandler, educatorController.updateProfile as unknown as RequestHandler);
router.get('/educator/analytics', authenticateUser as unknown as RequestHandler, educatorController.getAnalytics as unknown as RequestHandler);

export default router;