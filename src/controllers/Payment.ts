
import { Response, Request } from 'express';
import { PaymentService } from '../utils/paymentService.ts';
import { db } from '../db/index.ts';
import { transactionsTable, coursesTable } from '../db/schema.ts';
import { and, eq, desc } from 'drizzle-orm';
import { razorpay } from '../db/index.ts';


interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
    };
}

export const createPayment = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { courseId, amount, currency } = req.body;
        const userId = req.user?.id;

        if (!courseId || !userId || !amount || !currency) {
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
            .where(eq(coursesTable.id, courseId))
            .limit(1);

        if (!course.length) {
            return res.status(404).json({ 
                success: false, 
                message: "Course not found" 
            });
        }

        // Create Razorpay order
        const order = await PaymentService.createOrder(Number(amount), {
            courseId,
            userId,
            courseName: course[0].name,
        });

        // Return the structured response
        return res.status(200).json({ 
            success: true, 
            key: process.env.RAZORPAY_KEY_ID,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency
            }
        });
    } catch (error: any) {
        console.error('Payment creation error:', error);
        return res.status(500).json({ 
            success: false, 
            message: error.message || 'Error creating payment' 
        });
    }
};

export const verifyPayment = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            courseId
        } = req.body;

        const userId = req.user?.id;

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification details"
            });
        }

        // Verify payment signature
        const isValid = PaymentService.verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        // Get order details to fetch correct amount
        const order = await razorpay.orders.fetch(razorpay_order_id);

        // Add these checks before recording transaction
        const existingTransaction = await db
            .select()
            .from(transactionsTable)
            .where(eq(transactionsTable.paymentId, razorpay_payment_id))
            .limit(1);

        if (existingTransaction.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Payment already processed"
            });
        }

        // Verify payment status with Razorpay
        const payment = await razorpay.payments.fetch(razorpay_payment_id);
        if (payment.status !== 'captured') {
            return res.status(400).json({
                success: false,
                message: "Payment not captured"
            });
        }

        const transaction = await db.insert(transactionsTable).values({
            userId: userId as string,
            courseId,
            paymentId: razorpay_payment_id,
            status: 'completed',
            date: new Date(),
            amount: (Number(order.amount) / 100).toString() // Convert from paise to rupees
        }).returning();

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            data: transaction[0]
        });

    } catch (error: any) {
        console.error('Payment verification error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error verifying payment'
        });
    }
};

export const getTransactionHistory = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

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
            speed: speed,
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

export const testRazorpayConnection = async (req: Request, res: Response) => {
    try {
        // Log initialization parameters
        console.log('Testing Razorpay connection with:', {
            keyIdExists: !!process.env.RAZORPAY_KEY_ID,
            keyIdPrefix: process.env.RAZORPAY_KEY_ID?.substring(0, 4),
            secretExists: !!process.env.RAZORPAY_SECRET
        });

        // Verify credentials are present
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
            return res.status(500).json({
                success: false,
                message: 'Razorpay credentials are missing',
                details: {
                    keyIdPresent: !!process.env.RAZORPAY_KEY_ID,
                    secretPresent: !!process.env.RAZORPAY_SECRET
                }
            });
        }

        // Try to fetch a list of payments with error handling
        try {
            const response = await razorpay.payments.all({
                from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                to: new Date().toISOString(),
                count: 1 // Limit to 1 payment to minimize data transfer
            });
            
            return res.status(200).json({
                success: true,
                message: 'Razorpay connection successful',
                keyId: process.env.RAZORPAY_KEY_ID?.substring(0, 4) + '...',
                keyIdLength: process.env.RAZORPAY_KEY_ID?.length,
                secretLength: process.env.RAZORPAY_SECRET?.length,
                apiResponse: response ? 'Received' : 'Empty'
            });
        } catch (apiError: any) {
            console.error('Razorpay API error:', {
                error: apiError,
                message: apiError.message,
                description: apiError.error?.description,
                code: apiError.error?.code
            });

            return res.status(500).json({
                success: false,
                message: 'Razorpay API call failed',
                error: {
                    message: apiError.message,
                    description: apiError.error?.description,
                    code: apiError.error?.code
                }
            });
        }
    } catch (error: any) {
        console.error('Razorpay connection test error:', error);
        return res.status(500).json({
            success: false,
            message: 'Razorpay connection test failed',
            error: error.message
        });
    }
};

