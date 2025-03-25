import { z } from 'zod';

export const adminActionSchema = z.object({
  params: z.object({
    userId: z.string().uuid('Invalid user ID'),
    courseId: z.string().uuid('Invalid course ID'),
    moduleId: z.string().uuid('Invalid module ID'),
    contentId: z.string().uuid('Invalid content ID'),
  }).partial(),
  body: z.object({
    reason: z.string()
      .min(1, 'Reason is required')
      .max(500, 'Reason must be less than 500 characters')
  })
});

export type AdminActionInput = z.infer<typeof adminActionSchema>;