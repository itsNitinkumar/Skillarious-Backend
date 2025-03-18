import express from 'express';
import { RequestHandler } from 'express';
import { createDoubt, replyToDoubt, getRealtimeStatus } from '../controllers/Doubt.ts';
import { createModule } from '../controllers/Module.ts';
import { authenticateUser } from '../controllers/Auth.ts';

const router = express.Router();

// Doubts related routes
router.post('/createDoubt', authenticateUser as unknown as RequestHandler, createDoubt as unknown as RequestHandler);
router.post('/replyToDoubt/:id', authenticateUser as unknown as RequestHandler, replyToDoubt as unknown as RequestHandler);

// New route for realtime status
router.get('/realtime-status', getRealtimeStatus as unknown as RequestHandler);

// Modules related routes
router.post('/createModule', authenticateUser as unknown as RequestHandler, createModule as unknown as RequestHandler);

export default router;



