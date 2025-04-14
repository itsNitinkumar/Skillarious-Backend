import express from "express"; // Import express
import { 
    createPayment, 
    verifyPayment, 
    getTransactionHistory,
    refundPayment,
    testRazorpayConnection 
} from "../controllers/Payment.ts";
import { authenticateUser } from "../controllers/Auth.ts";
import { validatePaymentRequest } from "../middleware/validateSchema.ts";

const router = express.Router();

// Apply authentication middleware to all payment routes
router.use(authenticateUser as express.RequestHandler);

// Create payment route
router.post(
    "/create",
    validatePaymentRequest('create') as express.RequestHandler,
    createPayment as unknown as express.RequestHandler
);

// Verify payment route
router.post(
    "/verify",
    validatePaymentRequest('verify') as express.RequestHandler,
    verifyPayment as unknown as express.RequestHandler
);

// Get transaction history
router.get("/history", getTransactionHistory as unknown as express.RequestHandler);

// Refund route
router.post("/refund", refundPayment as unknown as express.RequestHandler);

router.get("/test-connection", testRazorpayConnection as unknown as express.RequestHandler);

export default router;
