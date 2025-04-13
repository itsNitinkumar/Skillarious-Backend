
import { Request, Response } from "express";
import { db, razorpay } from "../db/index.ts";
import { transactionsTable, coursesTable, usersTable } from "../db/schema.ts"; 
import crypto from "crypto";
import { eq, and } from "drizzle-orm";

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export const createPayment = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { courseId } = req.body;
        const userId = req.user?.id;

        if (!courseId || !userId) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields" 
            });
        }

        // Check if user has already purchased the course
        const existingTransaction = await db
            .select()
            .from(transactionsTable)
            .where(
                and(
                    eq(transactionsTable.userId, userId),
                    eq(transactionsTable.courseId, courseId),
                    eq(transactionsTable.status, 'completed')
                )
            );

        if (existingTransaction.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Course already purchased"
            });
        }

        // Get course details
        const course = await db
            .select()
            .from(coursesTable)
            .where(eq(coursesTable.id, courseId));

        if (!course.length) {
            return res.status(404).json({ 
                success: false, 
                message: "Course not found" 
            });
        }

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: course[0].price * 100, // Convert to paise
            currency: "INR",
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
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Payment creation error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error creating payment' 
        });
    }
};

export const verifyPayment = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            courseId
        } = req.body;

        const userId = req.user?.id;

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

        // Get order details
        const order = await razorpay.orders.fetch(razorpay_order_id);

        // Create transaction record
        const transaction = await db.insert(transactionsTable).values({
            userId: userId,
            amount: (order.amount / 100).toString(),
            courseId: courseId,
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            status: 'completed',
            date: new Date()
        }).returning();

        // Grant course access to user (you might need to implement this based on your schema)
        await db.insert(userCoursesTable).values({
            userId: userId,
            courseId: courseId,
            enrolledAt: new Date(),
            status: 'active'
        });

        return res.status(200).json({
            success: true,
            message: 'Payment verified and enrollment recorded successfully',
            data: transaction[0]
        });

    } catch (error) {
        console.error('Payment verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error verifying payment'
        });
    }
};

export const getTransactionHistory = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        const transactions = await db
            .select({
                id: transactionsTable.id,
                amount: transactionsTable.amount,
                status: transactionsTable.status,
                date: transactionsTable.date,
                courseName: coursesTable.name
            })
            .from(transactionsTable)
            .innerJoin(coursesTable, eq(transactionsTable.courseId, coursesTable.id))
            .where(eq(transactionsTable.userId, userId))
            .orderBy(desc(transactionsTable.date));

        return res.status(200).json({
            success: true,
            data: transactions
        });

    } catch (error) {
        console.error('Error fetching transaction history:', error);
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

//  controller for getting payment status
// export const getPaymentStatus = async (req: Request, res: Response) => {
//     try {
//         const { paymentId } = req.params;
        
//         if (!paymentId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Payment ID is required"
//             });
//         }

//         const payment = await razorpay.payments.fetch(paymentId);
        
//         return res.status(200).json({
//             success: true,
//             data: payment
//         });
//     } catch (error) {
//         console.error('Payment status error:', error);
//         return res.status(500).json({
//             success: false,
//             message: 'Error fetching payment status'
//         });
//     }
// };

