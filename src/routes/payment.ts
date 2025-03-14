
import express from "express";
import { createPayment, verifyPayment, getTransactionHistory, refundPayment } from "../controllers/Payment.ts";
import { authenticateUser } from "../controllers/Auth.ts";
const router = express.Router();



// Protected routes
//router.use(authenticateUser as express.RequestHandler);
router.post("/create", createPayment as unknown as express.RequestHandler);
router.post("/verify", verifyPayment as unknown as express.RequestHandler);
router.get("/history", getTransactionHistory as unknown as express.RequestHandler);
router.post("/refund", refundPayment as unknown as express.RequestHandler);
export default router;
