CREATE TABLE "category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"course_id" uuid
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"doubt_id" uuid NOT NULL,
	"text" text NOT NULL,
	"is_response" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"date" timestamp NOT NULL,
	"course_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "message" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "transaction" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "message" CASCADE;--> statement-breakpoint
DROP TABLE "transaction" CASCADE;--> statement-breakpoint
ALTER TABLE "classes" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "classes" ALTER COLUMN "views" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "classes" ALTER COLUMN "duration" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "classes" ALTER COLUMN "file_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "start" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "end" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "price" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "price" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "doubts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "doubts" ALTER COLUMN "resolved" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "educators" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "educators" ALTER COLUMN "doubt_open" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "modules" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "modules" ALTER COLUMN "duration" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "otps" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "rating" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "study_materials" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "thumbnail" text NOT NULL;--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_doubt_id_doubts_id_fk" FOREIGN KEY ("doubt_id") REFERENCES "public"."doubts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" DROP COLUMN "rating";--> statement-breakpoint
ALTER TABLE "educators" DROP COLUMN "rating";--> statement-breakpoint
ALTER TABLE "otps" DROP COLUMN "last_sent";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "refresh_token";