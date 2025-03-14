
import { Request, Response } from "express";
import { db,razorpay } from "../db/index.ts";
import { transactionsTable, coursesTable } from "../db/schema.ts"; 
import crypto from "crypto";
import { eq } from "drizzle-orm";

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
    };
}

// controller for a new payment order
export const createPayment = async (req: Request, res: Response) => {
    try {
        const { courseId, amount, userId, currency = "INR" } = req.body; // Add currency with default value
        
        if (!courseId || !amount || !userId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const course = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId));
        if (!course.length) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        // Create razorpay order with notes and currency
        const order = await razorpay.orders.create({
            amount: amount * 100, // Convert to smallest currency unit
            currency: currency,   // Add currency
            receipt: `receipt_${Date.now()}`,
            notes: {
                courseId: courseId,
                userId: userId,
                courseName: course[0].name,
                purpose: "Course Purchase"
            }
        });

        return res.status(200).json({ 
            success: true, 
            order,
            key: process.env.RAZORPAY_KEY_ID // Send key for frontend integration
        });
    } catch (error) {
        console.error('Payment creation error:', error);
        return res.status(500).json({ success: false, message: 'Error creating payment' });
    }
};
// controller to verify payment after Razorpay callback
export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const {razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId, userId} = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courseId || !userId) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields" 
            });
        }

        // Verify payment signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET || "")
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid payment signature" 
            });
        }

        // Create transaction record
        const transaction = await db.insert(transactionsTable).values({
            userId: userId,
            amount: razorpay_order_id.amount.toString(),
            courseId: courseId,
            paymentId: razorpay_payment_id,
            status: 'completed',
            date: new Date()
        }).returning();

        return res.status(200).json({
            success: true,
            message: 'Payment verified and enrollment recorded successfully',
            data: transaction
        });

    } catch (error) {
        console.error('Payment verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error verifying payment'
        });
    }
};
// Controller for getting tracnsaction history for a user
export const getTransactionHistory = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authorized"
            });
        }
        const transactions = await db
            .select()
            .from(transactionsTable)
            .where(eq(transactionsTable.userId, userId));
        return res.status(200).json({
            success: true,
            transactions
        });
    } catch (error) {
        console.error('Transaction history error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching transaction history'
        });
    }
};

// Controller for refunding a payment
export const refundPayment = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { paymentId, amount, reason = "Customer requested refund", speed = "normal" } = req.body;
        
        if (!paymentId) {
            return res.status(400).json({ 
                success: false, 
                message: "Payment ID is required" 
            });
        }

        const refund = await razorpay.payments.refund(paymentId, {
            amount: amount ? amount * 100 : undefined, // Convert to smallest currency unit
            speed: speed, // 'normal' or 'optimum'
            notes: {
                reason: reason,
                refundedBy: req.user?.id || 'system'
            }
        });

        // Update transaction status in database
        await db
            .update(transactionsTable)
            .set({ 
                status: 'refunded',
                refundReason: reason,
                refundDate: new Date()
            })
            .where(eq(transactionsTable.paymentId, paymentId));

        return res.status(200).json({
            success: true,
            refund,
            message: 'Refund initiated successfully'
        });
    } catch (error) {
        console.error('Refund error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error processing refund'
        });
    }
};

