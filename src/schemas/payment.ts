// Input interfaces for payment operations
export interface CreatePaymentRequest {
    courseId: string;
}

export interface VerifyPaymentRequest {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    courseId: string;
}

// Response interfaces
export interface PaymentOrderResponse {
    success: boolean;
    key: string;
    order: {
        id: string;
        amount: number;
        currency: string;
    };
    message?: string;
}

export interface PaymentVerificationResponse {
    success: boolean;
    message: string;
    data?: {
        transactionId: string;
        amount: number;
        status: string;
    };
}

// Validation functions
export function validateCreatePaymentRequest(req: any): { isValid: boolean; error?: string } {
    if (!req.body?.courseId) {
        return { isValid: false, error: "Course ID is required" };
    }
    
    // UUID validation regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(req.body.courseId)) {
        return { isValid: false, error: "Invalid course ID format" };
    }

    return { isValid: true };
}

export function validateVerifyPaymentRequest(req: any): { isValid: boolean; error?: string } {
    const required = [
        'razorpay_order_id',
        'razorpay_payment_id',
        'razorpay_signature',
        'courseId'
    ];

    for (const field of required) {
        if (!req.body?.[field]) {
            return { isValid: false, error: `${field} is required` };
        }
    }

    // UUID validation for courseId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(req.body.courseId)) {
        return { isValid: false, error: "Invalid course ID format" };
    }

    return { isValid: true };
}

