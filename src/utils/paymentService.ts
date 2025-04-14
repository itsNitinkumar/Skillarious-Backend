import crypto from 'crypto';
import { razorpay } from '../db/index.ts';

class PaymentService {
    static async createOrder(amount: number, options: {
        courseId: string;
        userId: string;
        courseName: string;
    }) {
        try {
            // Ensure amount is a valid number and convert to paise
            const amountInPaise = Math.round(amount * 100);
            
            if (isNaN(amountInPaise) || amountInPaise <= 0) {
                throw new Error('Invalid amount');
            }

            // Log the request details for debugging
            console.log('Creating Razorpay order with details:', {
                amount: amountInPaise,
                currency: 'INR',
                receipt: `receipt_${Date.now()}`,
                notes: options
            });

            const order = await razorpay.orders.create({
                amount: amountInPaise,
                currency: 'INR',
                receipt: `receipt_${Date.now()}`,
                notes: {
                    courseId: options.courseId,
                    userId: options.userId,
                    courseName: options.courseName
                }
            });

            console.log('Razorpay order created successfully:', order);
            return order;
        } catch (error: any) {
            console.error('Razorpay error details:', {
                errorObject: error,
                errorDescription: error.error?.description,
                errorCode: error.error?.code,
                statusCode: error.statusCode
            });

            if (error.statusCode === 401 || error.error?.description === 'Authentication failed') {
                throw new Error('Invalid Razorpay credentials. Please check your API keys.');
            }

            throw new Error(
                error.error?.description || 
                error.message || 
                'Failed to create payment order'
            );
        }
    }

    static verifyPaymentSignature(
        orderId: string,
        paymentId: string,
        signature: string
    ): boolean {
        if (!process.env.RAZORPAY_SECRET) {
            throw new Error('RAZORPAY_SECRET must be provided in environment variables');
        }

        const body = `${orderId}|${paymentId}`;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET.trim())
            .update(body)
            .digest("hex");
        
        return expectedSignature === signature;
    }
}

export { PaymentService };



