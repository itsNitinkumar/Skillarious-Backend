import express from 'express';
import { authenticateUser } from '../controllers/Auth.ts';
import { updateProfile, getProfile } from '../controllers/User.ts';

const router = express.Router();

// Get user profile
router.get('/getprofile', authenticateUser as express.RequestHandler, getProfile as unknown as express.RequestHandler);

// Update user profile
router.put('/updateprofile', authenticateUser as express.RequestHandler, updateProfile as unknown as express.RequestHandler);

export default router;








