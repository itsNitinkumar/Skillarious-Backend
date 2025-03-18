CREATE TABLE "category_courses" (
	"category_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	CONSTRAINT "composite_key" PRIMARY KEY("category_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"order" integer NOT NULL,
	"duration" real,
	"file_url" text NOT NULL,
	"file_type" text,
	"views" bigint DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_preview" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "enrollment_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"module_id" uuid NOT NULL,
	"completed_content" integer DEFAULT 0,
	"total_content" integer NOT NULL,
	"last_accessed" timestamp NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "enrollment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"completion_certificate" text,
	"completed_at" timestamp,
	"last_accessed" timestamp
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"related_id" uuid
);
--> statement-breakpoint
CREATE TABLE "progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"content_id" uuid NOT NULL,
	"completed" boolean DEFAULT false,
	"last_accessed" timestamp NOT NULL,
	"time_spent" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "category" DROP CONSTRAINT "category_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "study_materials" ALTER COLUMN "module_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "doubts" ADD COLUMN "content_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "doubts" ADD COLUMN "title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "doubts" ADD COLUMN "description" text NOT NULL;--> statement-breakpoint
ALTER TABLE "doubts" ADD COLUMN "status" text NOT NULL;--> statement-breakpoint
ALTER TABLE "study_materials" ADD COLUMN "title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "study_materials" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "study_materials" ADD COLUMN "file_url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "study_materials" ADD COLUMN "file_type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "study_materials" ADD COLUMN "upload_date" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "status" text DEFAULT 'completed' NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "payment_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "refund_reason" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "refund_date" timestamp;--> statement-breakpoint
ALTER TABLE "category_courses" ADD CONSTRAINT "category_courses_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_courses" ADD CONSTRAINT "category_courses_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content" ADD CONSTRAINT "content_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment_progress" ADD CONSTRAINT "enrollment_progress_enrollment_id_enrollment_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment_progress" ADD CONSTRAINT "enrollment_progress_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress" ADD CONSTRAINT "progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress" ADD CONSTRAINT "progress_content_id_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category" DROP COLUMN "course_id";--> statement-breakpoint
ALTER TABLE "study_materials" DROP COLUMN "file_id";