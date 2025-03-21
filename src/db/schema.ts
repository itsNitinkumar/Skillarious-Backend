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
  primaryKey,
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
  age: bigint('age', { mode: 'number' }),
  isEducator: boolean('is_educator').notNull().default(false),
  verified: boolean('verified').notNull().default(false),
  refreshToken: text("refresh_token"),
  isAdmin: boolean('is_admin').default(false).notNull(),
  role: text('role').default('user').notNull(), // 'user', 'educator', 'admin'
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
  name: text('name').notNull().unique(),
  description: text('description'),
});

// CATEGORY_COURSES TABLE
export const categoryCoursesTable = pgTable(
  'category_courses',
  {
    categoryId: uuid('category_id').notNull().references(() => categoryTable.id),
    courseId: uuid('course_id').notNull().references(() => coursesTable.id),
  },
  (table) => ({
    cpk: primaryKey({ name: 'composite_key', columns: [table.categoryId, table.courseId] }),
  }),
);

// MODULES TABLE
export const modulesTable = pgTable('modules', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  courseId: uuid('course_id').notNull().references(() => coursesTable.id),
  name: text('name').notNull(),
  duration: real('duration'), // Using real() for float
  videoCount: bigint('video_count', { mode: 'number' }),
  materialCount: bigint('material_count', { mode: 'number' }),
});

// CLASSES TABLE
export const classesTable = pgTable('classes', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  moduleId: uuid('module_id').notNull().references(() => modulesTable.id),
  views: bigint('views', { mode: 'number' }),
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
  rating: real('rating').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
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
  order: integer('order').notNull(),
  fileUrl: text('file_url').notNull(),
  type: text('type').notNull(), // Instead of fileType
  views: bigint('views', { mode: 'number' }).default(0),
  duration: real('duration'), // Optional: for video/audio files
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  isPreview: boolean('is_preview').default(false),
});



// Type definitions
export type Content = typeof contentTable.$inferSelect;
export type InsertContent = typeof contentTable.$inferInsert;

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
