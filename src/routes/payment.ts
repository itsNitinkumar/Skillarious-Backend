
import express from "express";
import { 
  createPayment, 
  verifyPayment, 
  getTransactionHistory,
  refundPayment 
} from "../controllers/Payment.ts";
import { authenticateUser } from "../controllers/Auth.ts";
import { validateSchema } from "../middleware/validateSchema.ts";
import { 
  createPaymentSchema, 
  verifyPaymentSchema, 
  refundSchema 
} from "../schemas/payment.ts";

const router = express.Router();

// Apply authentication middleware to all payment routes
router.use(authenticateUser as express.RequestHandler);

// Create payment route
router.post(
  "/create",
  validateSchema(createPaymentSchema) as express.RequestHandler,
  createPayment as express.RequestHandler
);

// Verify payment route
router.post(
  "/verify",
  validateSchema(verifyPaymentSchema) as express.RequestHandler,
  verifyPayment as express.RequestHandler
);

// Get transaction history
router.get(
  "/history",
  getTransactionHistory as express.RequestHandler
);

// Refund route (optional)
router.post(
  "/refund",
  validateSchema(refundSchema) as express.RequestHandler,
  refundPayment as express.RequestHandler
);

export default router;
