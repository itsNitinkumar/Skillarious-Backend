import { razorpay } from '../db/index.ts';
import crypto from 'crypto';

export class PaymentService {
  static async createOrder(amount: number, options: {
    courseId: string;
    userId: string;
    courseName: string;
  }) {
    return await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        courseId: options.courseId,
        userId: options.userId,
        courseName: options.courseName,
        purpose: "Course Purchase"
      }
    });
  }

  static verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET!)
      .update(body)
      .digest("hex");
    
    return expectedSignature === signature;
  }

  static async fetchPaymentDetails(paymentId: string) {
    return await razorpay.payments.fetch(paymentId);
  }

  static async initiateRefund(paymentId: string, options: {
    amount?: number;
    speed?: 'normal' | 'optimum';
    notes?: Record<string, string>;
  } = {}) {
    return await razorpay.payments.refund(paymentId, {
      amount: options.amount,
      speed: options.speed || 'normal',
      notes: options.notes
    });
  }

  static async getRefundStatus(paymentId: string, refundId: string) {
    return await razorpay.payments.fetchRefund(paymentId, refundId);
  }
}