import { pgTable, uuid, bigint, text, timestamp, unique, boolean, foreignKey, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const otps = pgTable("otps", {
	id: uuid().primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	value: bigint({ mode: "number" }).notNull(),
	email: text().notNull(),
	expiry: timestamp({ mode: 'string' }).notNull(),
	lastSent: timestamp("last_sent", { mode: 'string' }).notNull(),
});

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	password: text().notNull(),
	pfp: text(),
	phone: text(),
	gender: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	age: bigint({ mode: "number" }),
	isEducator: boolean("is_educator").default(false).notNull(),
	verified: boolean().default(false).notNull(),
	refreshToken: text("refresh_token"),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const modules = pgTable("modules", {
	id: uuid().primaryKey().notNull(),
	courseId: uuid("course_id").notNull(),
	name: text().notNull(),
	duration: numeric(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	videoCount: bigint("video_count", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	materialCount: bigint("material_count", { mode: "number" }),
}, (table) => [
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [courses.id],
			name: "modules_course_id_courses_id_fk"
		}),
]);

export const classes = pgTable("classes", {
	id: uuid().primaryKey().notNull(),
	moduleId: uuid("module_id").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	views: bigint({ mode: "number" }).notNull(),
	duration: timestamp({ mode: 'string' }).notNull(),
	fileId: text("file_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.moduleId],
			foreignColumns: [modules.id],
			name: "classes_module_id_modules_id_fk"
		}),
]);

export const educators = pgTable("educators", {
	id: uuid().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	bio: text(),
	about: text(),
	rating: numeric(),
	doubtOpen: boolean("doubt_open").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "educators_user_id_users_id_fk"
		}),
]);

export const courses = pgTable("courses", {
	id: uuid().primaryKey().notNull(),
	name: text().notNull(),
	description: text().notNull(),
	about: text(),
	rating: numeric(),
	comments: text(),
	start: timestamp({ mode: 'string' }),
	end: timestamp({ mode: 'string' }),
	educatorId: uuid("educator_id").notNull(),
	price: numeric(),
}, (table) => [
	foreignKey({
			columns: [table.educatorId],
			foreignColumns: [educators.id],
			name: "courses_educator_id_educators_id_fk"
		}),
]);

export const files = pgTable("files", {
	id: uuid().primaryKey().notNull(),
	owner: uuid().notNull(),
	name: text(),
	uploaded: timestamp({ mode: 'string' }).notNull(),
	link: text().notNull(),
	type: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.owner],
			foreignColumns: [users.id],
			name: "files_owner_users_id_fk"
		}),
]);

export const doubts = pgTable("doubts", {
	id: uuid().primaryKey().notNull(),
	fileId: uuid("file_id"),
	message: text().notNull(),
	classId: uuid("class_id"),
	date: timestamp({ mode: 'string' }).notNull(),
	educatorAssigned: uuid("educator_assigned"),
	resolved: boolean().notNull(),
	userId: uuid("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.classId],
			foreignColumns: [classes.id],
			name: "doubts_class_id_classes_id_fk"
		}),
	foreignKey({
			columns: [table.educatorAssigned],
			foreignColumns: [educators.id],
			name: "doubts_educator_assigned_educators_id_fk"
		}),
	foreignKey({
			columns: [table.fileId],
			foreignColumns: [files.id],
			name: "doubts_file_id_files_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "doubts_user_id_users_id_fk"
		}),
]);

export const message = pgTable("message", {
	id: uuid().primaryKey().notNull(),
	doubtId: uuid("doubt_id").notNull(),
	text: text().notNull(),
	isResponse: boolean("is_response").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.doubtId],
			foreignColumns: [doubts.id],
			name: "message_doubt_id_doubts_id_fk"
		}),
]);

export const reviews = pgTable("reviews", {
	id: uuid().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	educatorId: uuid("educator_id"),
	courseId: uuid("course_id"),
	message: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	rating: bigint({ mode: "number" }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [courses.id],
			name: "reviews_course_id_courses_id_fk"
		}),
	foreignKey({
			columns: [table.educatorId],
			foreignColumns: [educators.id],
			name: "reviews_educator_id_educators_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "reviews_user_id_users_id_fk"
		}),
]);

export const studyMaterials = pgTable("study_materials", {
	id: uuid().primaryKey().notNull(),
	moduleId: uuid("module_id").notNull(),
	fileId: text("file_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.moduleId],
			foreignColumns: [modules.id],
			name: "study_materials_module_id_modules_id_fk"
		}),
]);

export const transaction = pgTable("transaction", {
	id: uuid().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	amount: numeric().notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	courseId: uuid("course_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [courses.id],
			name: "transaction_course_id_courses_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "transaction_user_id_users_id_fk"
		}),
]);

export const contentTable = pgTable('content', {
	id: uuid().primaryKey().notNull(),
	moduleId: uuid("module_id").notNull(),
	fileId: text("file_id").notNull(),
	fileType: text('file_type').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.moduleId],
			foreignColumns: [modules.id],
			name: "content_module_id_modules_id_fk"
		}),
]);





