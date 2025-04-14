import { Request, Response, NextFunction } from 'express';
import { validateCreatePaymentRequest, validateVerifyPaymentRequest } from '../schemas/payment';

export const validatePaymentRequest = (type: 'create' | 'verify') => {
    return (req: Request, res: Response, next: NextFunction) => {
        const validator = type === 'create' ? validateCreatePaymentRequest : validateVerifyPaymentRequest;
        const { isValid, error } = validator(req);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                error: error
            });
        }

        next();
    };
};
