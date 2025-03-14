import { relations } from "drizzle-orm/relations";
import { courses, modules, classes, users, educators, files, doubts, message, reviews, studyMaterials, transaction } from "./schema";

export const modulesRelations = relations(modules, ({one, many}) => ({
	course: one(courses, {
		fields: [modules.courseId],
		references: [courses.id]
	}),
	classes: many(classes),
	studyMaterials: many(studyMaterials),
}));

export const coursesRelations = relations(courses, ({one, many}) => ({
	modules: many(modules),
	educator: one(educators, {
		fields: [courses.educatorId],
		references: [educators.id]
	}),
	reviews: many(reviews),
	transactions: many(transaction),
}));

export const classesRelations = relations(classes, ({one, many}) => ({
	module: one(modules, {
		fields: [classes.moduleId],
		references: [modules.id]
	}),
	doubts: many(doubts),
}));

export const educatorsRelations = relations(educators, ({one, many}) => ({
	user: one(users, {
		fields: [educators.userId],
		references: [users.id]
	}),
	courses: many(courses),
	doubts: many(doubts),
	reviews: many(reviews),
}));

export const usersRelations = relations(users, ({many}) => ({
	educators: many(educators),
	files: many(files),
	doubts: many(doubts),
	reviews: many(reviews),
	transactions: many(transaction),
}));

export const filesRelations = relations(files, ({one, many}) => ({
	user: one(users, {
		fields: [files.owner],
		references: [users.id]
	}),
	doubts: many(doubts),
}));

export const doubtsRelations = relations(doubts, ({one, many}) => ({
	class: one(classes, {
		fields: [doubts.classId],
		references: [classes.id]
	}),
	educator: one(educators, {
		fields: [doubts.educatorAssigned],
		references: [educators.id]
	}),
	file: one(files, {
		fields: [doubts.fileId],
		references: [files.id]
	}),
	user: one(users, {
		fields: [doubts.userId],
		references: [users.id]
	}),
	messages: many(message),
}));

export const messageRelations = relations(message, ({one}) => ({
	doubt: one(doubts, {
		fields: [message.doubtId],
		references: [doubts.id]
	}),
}));

export const reviewsRelations = relations(reviews, ({one}) => ({
	course: one(courses, {
		fields: [reviews.courseId],
		references: [courses.id]
	}),
	educator: one(educators, {
		fields: [reviews.educatorId],
		references: [educators.id]
	}),
	user: one(users, {
		fields: [reviews.userId],
		references: [users.id]
	}),
}));

export const studyMaterialsRelations = relations(studyMaterials, ({one}) => ({
	module: one(modules, {
		fields: [studyMaterials.moduleId],
		references: [modules.id]
	}),
}));

export const transactionRelations = relations(transaction, ({one}) => ({
	course: one(courses, {
		fields: [transaction.courseId],
		references: [courses.id]
	}),
	user: one(users, {
		fields: [transaction.userId],
		references: [users.id]
	}),
}));