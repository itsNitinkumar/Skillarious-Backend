import { Request, Response } from 'express';
import { db } from '../db/index.ts';
import { reviewsTable, coursesTable, transactionsTable } from '../db/schema.ts';
import { eq, avg, desc, and } from 'drizzle-orm';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
    };
}

// Create a new review
export const createReview = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { rating, message, courseId } = req.body;

        if (!userId || !rating || !courseId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check if user has purchased the course
        const transaction = await db
            .select()
            .from(transactionsTable)
            .where(
                and(
                    eq(transactionsTable.courseId, courseId),
                    eq(transactionsTable.userId, userId),
                    eq(transactionsTable.status, 'completed')
                )
            );

        if (!transaction.length) {
            return res.status(403).json({
                success: false,
                message: 'You must purchase the course before reviewing'
            });
        }
        // check if a review already exist or not
        const existingReview = await db
            .select()
            .from(reviewsTable)
            .where(
                and(
                    eq(reviewsTable.userId, userId),
                    eq(reviewsTable.courseId, courseId)
                )
            );

        if (existingReview.length) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this course.' 
            })
        }

        // Create new review
        const review = await db
            .insert(reviewsTable)
            .values({
                userId,
                courseId,
                rating,
                message
            })
            .returning();

        return res.status(201).json({
            success: true,
            message: 'Review created successfully',
            review: review[0]
        });
    } catch (error) {
          console.error('Review creation error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error creating review'
        });
    }
};

// Update an existing review
export const updateReview = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { courseId } = req.params;
        const { rating, message } = req.body; 

        if (!userId || !rating || !courseId) { 
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // First check if review exists
        const existingReview = await db
            .select()
            .from(reviewsTable)
            .where(
                and(
                    eq(reviewsTable.userId, userId),
                    eq(reviewsTable.courseId, courseId)
                )
            );

        if (!existingReview.length) {
            return res.status(404).json({
                success: false,
                message: 'You haven\'t reviewed this course yet.'
            });
        }

        // Update the review
        const updatedReview = await db
            .update(reviewsTable)
            .set({
                rating,
                message, 
            })
            .where(
                and(
                    eq(reviewsTable.userId, userId),
                    eq(reviewsTable.courseId, courseId)
                )
            )
            .returning();

        return res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            review: updatedReview[0]
        });
    } catch (error) {
        console.error('Review update error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating review'
        });
    }
};

// Get average rating for a course
export const getAverageRating = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;

        const result = await db
            .select({
                averageRating: avg(reviewsTable.rating)
            })
            .from(reviewsTable)
            .where(eq(reviewsTable.courseId, courseId));

        const averageRating = result[0]?.averageRating || 0;

        return res.status(200).json({
            success: true,
            averageRating
        });
    } catch (error) {
        console.error('Error fetching average rating:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching average rating'
        });
    }
};

// Get all reviews for a course
export const getCourseReviews = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;

        const reviews = await db
            .select()
            .from(reviewsTable)
            .where(eq(reviewsTable.courseId, courseId))
            .orderBy(desc(reviewsTable.rating));

        return res.status(200).json({
            success: true,
            reviews
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching reviews'
        });
    }
};

// Delete a review
export const deleteReview = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { courseId } = req.params;

        if (!userId || !courseId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check if review exists
        const existingReview = await db
            .select()
            .from(reviewsTable)
            .where(
                and(
                    eq(reviewsTable.userId, userId),
                    eq(reviewsTable.courseId, courseId)
                )
            );

        if (!existingReview.length) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Delete the review
        await db
            .delete(reviewsTable)
            .where(
                and(
                    eq(reviewsTable.userId, userId),
                    eq(reviewsTable.courseId, courseId)
                )
            );

        return res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Review deletion error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting review'
        });
    }
};
