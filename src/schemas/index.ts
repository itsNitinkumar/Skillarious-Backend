import { z } from 'zod';

// Base schemas for common fields
const uuidSchema = z.string().uuid('Invalid UUID format');
const timestampSchema = z.date().or(z.string().datetime());
const positiveNumber = z.number().positive();

// User Schema
export const userSchema = z.object({
  id: uuidSchema,
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  pfp: z.string().url().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  age: z.number().min(13).optional(),
  isEducator: z.boolean().default(false),
  verified: z.boolean().default(false),
  refreshToken: z.string().optional(),
  isAdmin: z.boolean().default(false),
  role: z.enum(['user', 'educator', 'admin']).default('user'),
  isBanned: z.boolean().default(false),
  banReason: z.string().optional(),
  bannedAt: timestampSchema.optional(),
  lastLogin: timestampSchema.optional()
});

// Educator Schema
export const educatorSchema = z.object({
  id: uuidSchema,
  userId: uuidSchema,
  bio: z.string().max(500).optional(),
  about: z.string().max(1000).optional(),
  doubtOpen: z.boolean().default(false)
});

// Course Schema
export const courseSchema = z.object({
  id: uuidSchema,
  name: z.string().min(3, 'Course name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  about: z.string().optional(),
  comments: z.string().optional(),
  start: timestampSchema,
  end: timestampSchema,
  educatorId: uuidSchema,
  price: z.number().min(0, 'Price cannot be negative'),
  thumbnail: z.string().url('Invalid thumbnail URL'),
  isDismissed: z.boolean().default(false),
  dismissReason: z.string().optional(),
  dismissedAt: timestampSchema.optional(),
  completionRate: z.number().min(0).max(100).optional(),
  viewCount: z.number().default(0)
});

// Module Schema
export const moduleSchema = z.object({
  id: uuidSchema,
  courseId: uuidSchema,
  name: z.string().min(3, 'Module name must be at least 3 characters'),
  duration: z.number().optional(),
  videoCount: z.number().optional(),
  materialCount: z.number().optional(),
  isDismissed: z.boolean().default(false),
  dismissReason: z.string().optional(),
  dismissedAt: timestampSchema.optional()
});

// Content Schema
export const contentSchema = z.object({
  id: uuidSchema,
  moduleId: uuidSchema,
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  order: z.number().int().positive(),
  fileUrl: z.string().url('Invalid file URL'),
  type: z.enum(['video', 'document', 'quiz', 'assignment']),
  views: z.number().default(0),
  duration: z.number().optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  isPreview: z.boolean().default(false),
  isDismissed: z.boolean().default(false),
  dismissReason: z.string().optional(),
  dismissedAt: timestampSchema.optional(),
  viewCount: z.number().default(0),
  timeSpent: z.number().default(0)
});

// Doubt Schema
export const doubtSchema = z.object({
  id: uuidSchema,
  fileId: uuidSchema.optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  classId: uuidSchema.optional(),
  date: timestampSchema,
  educatorAssigned: uuidSchema.optional(),
  resolved: z.boolean().default(false),
  userId: uuidSchema,
  contentId: z.string(),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  status: z.enum(['pending', 'assigned', 'resolved', 'closed'])
});

// Review Schema
export const reviewSchema = z.object({
  id: uuidSchema,
  userId: uuidSchema,
  educatorId: uuidSchema.optional(),
  courseId: uuidSchema.optional(),
  message: z.string().optional(),
  rating: z.number().min(1).max(5),
  createdAt: timestampSchema
});

// Transaction Schema
export const transactionSchema = z.object({
  id: uuidSchema,
  userId: uuidSchema,
  amount: z.number().positive(),
  date: timestampSchema,
  courseId: uuidSchema,
  status: z.enum(['pending', 'completed', 'failed', 'refunded']),
  paymentId: z.string(),
  refundReason: z.string().optional(),
  refundDate: timestampSchema.optional()
});

// Input schemas for API endpoints
export const createCourseInput = courseSchema.omit({ 
  id: true, 
  isDismissed: true, 
  dismissReason: true, 
  dismissedAt: true, 
  completionRate: true, 
  viewCount: true 
});

export const updateCourseInput = createCourseInput.partial();

export const createModuleInput = moduleSchema.omit({ 
  id: true, 
  isDismissed: true, 
  dismissReason: true, 
  dismissedAt: true 
});

export const createContentInput = contentSchema.omit({ 
  id: true, 
  views: true, 
  createdAt: true, 
  updatedAt: true, 
  isDismissed: true, 
  dismissReason: true, 
  dismissedAt: true, 
  viewCount: true, 
  timeSpent: true 
});

// Types inferred from schemas
export type User = z.infer<typeof userSchema>;
export type Educator = z.infer<typeof educatorSchema>;
export type Course = z.infer<typeof courseSchema>;
export type Module = z.infer<typeof moduleSchema>;
export type Content = z.infer<typeof contentSchema>;
export type Doubt = z.infer<typeof doubtSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type Transaction = z.infer<typeof transactionSchema>;