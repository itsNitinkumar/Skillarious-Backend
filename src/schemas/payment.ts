import { z } from 'zod';

export const createPaymentSchema = z.object({
  body: z.object({
    courseId: z.string().uuid('Invalid course ID'),
    amount: z.number().positive('Amount must be positive')
  })
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    razorpay_order_id: z.string(),
    razorpay_payment_id: z.string(),
    razorpay_signature: z.string(),
    courseId: z.string().uuid('Invalid course ID')
  })
});

export const refundSchema = z.object({
  body: z.object({
    paymentId: z.string(),
    reason: z.string().min(10, 'Reason must be at least 10 characters')
  })
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type RefundInput = z.infer<typeof refundSchema>;