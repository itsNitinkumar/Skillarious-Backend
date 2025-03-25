
import express from "express";
import { 
  createPayment, 
  verifyPayment, 
  getTransactionHistory, 
  refundPayment,
//  getPaymentStatus,
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

router.post(
  "/create", 
  validateSchema(createPaymentSchema) as express.RequestHandler,
  createPayment as unknown as express.RequestHandler
);

router.post(
  "/verify", 
  validateSchema(verifyPaymentSchema) as express.RequestHandler,
  verifyPayment as unknown as express.RequestHandler
);

router.get(
  "/history", 
  getTransactionHistory as unknown as express.RequestHandler
);

router.post(
  "/refund", 
  validateSchema(refundSchema) as express.RequestHandler,
  refundPayment as unknown as express.RequestHandler
);

// router.get(
//   "/status/:paymentId", 
//   getPaymentStatus as express.RequestHandler
// );

export default router;
