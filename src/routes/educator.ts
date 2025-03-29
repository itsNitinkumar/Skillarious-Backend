import express from 'express';
import { authenticateUser } from '../controllers/Auth.ts';
import {
  registerAsEducator,
  getEducatorProfile,
  updateEducatorProfile,
  toggleDoubtAvailability
} from '../controllers/Educator.ts';

const router = express.Router();

router.post('/register', authenticateUser as unknown as express.RequestHandler, registerAsEducator as unknown as express.RequestHandler);

router.get('/profile', authenticateUser as unknown as express.RequestHandler, getEducatorProfile as unknown as express.RequestHandler);

router.put('/profile', authenticateUser as unknown as express.RequestHandler, updateEducatorProfile as unknown as express.RequestHandler) ;

router.patch('/toggle-doubt', authenticateUser as unknown as express.RequestHandler, toggleDoubtAvailability as unknown as express.RequestHandler);

export default router;

