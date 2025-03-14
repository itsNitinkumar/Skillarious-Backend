import {
  pgTable,
  uuid,
  text,
  boolean,
  decimal,
  bigint,
  timestamp,
  real,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// USERS TABLE
export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  pfp: text('pfp'),
  phone: text('phone'),
  gender: text('gender'),
  age: bigint('age', { mode: 'bigint' }),
  isEducator: boolean('is_educator').notNull().default(false),
  verified: boolean('verified').notNull().default(false),
  refreshToken: text("refresh_token"),
});

// OTPS TABLE
export const otpsTable = pgTable('otps', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  value: bigint('value', { mode: 'bigint' }).notNull(),
  email: text('email').notNull(),
  expiry: timestamp('expiry').notNull(),
  lastSent: timestamp('last_sent').notNull(),
});

// EDUCATORS TABLE
export const educatorsTable = pgTable('educators', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => usersTable.id),
  bio: text('bio'),
  about: text('about'),
  doubtOpen: boolean('doubt_open').notNull().default(false),
});

// COURSES TABLE
export const coursesTable = pgTable('courses', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  description: text('description'),
  about: text('about'),
  comments: text('comments'),
  start: timestamp('start').notNull(),
  end: timestamp('end').notNull(),
  educatorId: uuid('educator_id').notNull().references(() => educatorsTable.id),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  thumbnail: text('thumbnail').notNull(),
});

// CATEGORY TABLE
export const categoryTable = pgTable('category', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  description: text('description').notNull(),
  courseId: uuid('course_id').references(() => coursesTable.id),
});

// MODULES TABLE
export const modulesTable = pgTable('modules', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  courseId: uuid('course_id').notNull().references(() => coursesTable.id),
  name: text('name').notNull(),
  duration: real('duration'), // Using real() for float
  videoCount: bigint('video_count', { mode: 'bigint' }),
  materialCount: bigint('material_count', { mode: 'bigint' }),
});

export const studyMaterialsTable = pgTable('study_materials', {
  id: uuid('id').defaultRandom().primaryKey(),
  moduleId: uuid('module_id').references(() => modulesTable.id),
  title: text('title').notNull(),
  description: text('description'),
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type').notNull(),
  uploadDate: timestamp('upload_date').notNull()
});

// CLASSES TABLE
export const classesTable = pgTable('classes', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  moduleId: uuid('module_id').notNull().references(() => modulesTable.id),
  views: bigint('views', { mode: 'bigint' }),
  duration: timestamp('duration'),
  fileId: text('file_id'),
});

// REVIEWS TABLE
export const reviewsTable = pgTable('reviews', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => usersTable.id),
  educatorId: uuid('educator_id').references(() => educatorsTable.id),
  courseId: uuid('course_id').references(() => coursesTable.id),
  message: text('message'),
  rating: real('rating').notNull(), // float => real
});

// TRANSACTIONS TABLE
export const transactionsTable = pgTable('transactions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => usersTable.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  date: timestamp('date').notNull(),
  courseId: uuid('course_id').notNull().references(() => coursesTable.id),
  status: text('status').notNull().default('completed'),
  paymentId: text('payment_id').notNull(),
  refundReason: text('refund_reason'),
  refundDate: timestamp('refund_date'),
});

// FILES TABLE
export const filesTable = pgTable('files', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  owner: uuid('owner').notNull().references(() => usersTable.id),
  name: text('name'),
  uploaded: timestamp('uploaded').notNull(),
  link: text('link').notNull(),
  type: text('type').notNull(),
});

// DOUBTS TABLE
export const doubtsTable = pgTable('doubts', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  fileId: uuid('file_id').references(() => filesTable.id),
  message: text('message').notNull(),
  classId: uuid('class_id').references(() => classesTable.id),
  date: timestamp('date').notNull(),
  educatorAssigned: uuid('educator_assigned').references(() => educatorsTable.id),
  resolved: boolean('resolved').notNull().default(false),
  userId: uuid('user_id').notNull().references(() => usersTable.id),
  contentId: text('content_id').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: text('status').notNull(),
});

// MESSAGES TABLE
export const messagesTable = pgTable('messages', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  doubtId: uuid('doubt_id').notNull().references(() => doubtsTable.id),
  text: text('text').notNull(),
  isResponse: boolean('is_response').notNull().default(false),
});

// CONTENT TABLE - Single table for all module content
export const contentTable = pgTable('content', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  moduleId: uuid('module_id').notNull().references(() => modulesTable.id),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').notNull(), // 'video' | 'document'
  order: integer('order').notNull(),
  duration: real('duration'), // for videos
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type'), // For study materials: 'pdf', 'doc', etc.
  views: bigint('views', { mode: 'bigint' }).default(0n),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  isPreview: boolean('is_preview').default(false),
});

// Progress tracking for content
export const progressTable = pgTable('progress', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => usersTable.id),
  contentId: uuid('content_id').notNull().references(() => contentTable.id),
  completed: boolean('completed').default(false),
  lastAccessed: timestamp('last_accessed').notNull(),
  timeSpent: integer('time_spent').default(0), // in seconds
});

// COURSE ENROLLMENT
export const enrollmentTable = pgTable('enrollment', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => usersTable.id),
  courseId: uuid('course_id').notNull().references(() => coursesTable.id),
  enrolledAt: timestamp('enrolled_at').notNull().defaultNow(),
  status: text('status').notNull().default('active'), // 'active' | 'completed' | 'dropped'
  completionCertificate: text('completion_certificate'),
  completedAt: timestamp('completed_at'),
  lastAccessed: timestamp('last_accessed'),
});

// Add enrollmentProgress to track overall course progress
export const enrollmentProgressTable = pgTable('enrollment_progress', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  enrollmentId: uuid('enrollment_id').notNull().references(() => enrollmentTable.id),
  moduleId: uuid('module_id').notNull().references(() => modulesTable.id),
  completedContent: integer('completed_content').default(0),
  totalContent: integer('total_content').notNull(),
  lastAccessed: timestamp('last_accessed').notNull(),
  completedAt: timestamp('completed_at'),
});

// Add notifications for course updates, doubts, etc.
export const notificationsTable = pgTable('notifications', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => usersTable.id),
  type: text('type').notNull(), // 'doubt_response', 'course_update', etc.
  title: text('title').notNull(),
  message: text('message').notNull(),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  relatedId: uuid('related_id'), // Could be doubtId, courseId, etc.
});

// Type definitions
export type Content = typeof contentTable.$inferSelect;
export type InsertContent = typeof contentTable.$inferInsert;

export type Progress = typeof progressTable.$inferSelect;
export type InsertProgress = typeof progressTable.$inferInsert;

export type Enrollment = typeof enrollmentTable.$inferSelect;
export type InsertEnrollment = typeof enrollmentTable.$inferInsert;

// -------------------------------------------------------
//                  TYPE DEFINITIONS
// -------------------------------------------------------
export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export type InsertEducator = typeof educatorsTable.$inferInsert;
export type SelectEducator = typeof educatorsTable.$inferSelect;

export type InsertCourse = typeof coursesTable.$inferInsert;
export type SelectCourse = typeof coursesTable.$inferSelect;

export type InsertCategory = typeof categoryTable.$inferInsert;
export type SelectCategory = typeof categoryTable.$inferSelect;

export type InsertModule = typeof modulesTable.$inferInsert;
export type SelectModule = typeof modulesTable.$inferSelect;

export type InsertStudyMaterial = typeof studyMaterialsTable.$inferInsert;
export type SelectStudyMaterial = typeof studyMaterialsTable.$inferSelect;

export type InsertClass = typeof classesTable.$inferInsert;
export type SelectClass = typeof classesTable.$inferSelect;

export type InsertReview = typeof reviewsTable.$inferInsert;
export type SelectReview = typeof reviewsTable.$inferSelect;

export type InsertTransaction = typeof transactionsTable.$inferInsert;
export type SelectTransaction = typeof transactionsTable.$inferSelect;

export type InsertFile = typeof filesTable.$inferInsert;
export type SelectFile = typeof filesTable.$inferSelect;

export type InsertDoubt = typeof doubtsTable.$inferInsert;
export type SelectDoubt = typeof doubtsTable.$inferSelect;

export type InsertMessage = typeof messagesTable.$inferInsert;
export type SelectMessage = typeof messagesTable.$inferSelect;

export type InsertOtp = typeof otpsTable.$inferInsert;
export type SelectOtp = typeof otpsTable.$inferSelect;
