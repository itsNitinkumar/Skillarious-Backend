import express from 'express';
import { RequestHandler } from 'express';
import * as moduleController from '../controllers/Module';
import * as classController from '../controllers/Class';
import * as doubtController from '../controllers/Doubt';
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


export default router;