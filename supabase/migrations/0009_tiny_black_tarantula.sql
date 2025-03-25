CREATE TABLE "admin_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"action" text NOT NULL,
	"target_id" uuid NOT NULL,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content" ADD COLUMN "is_dismissed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "content" ADD COLUMN "dismiss_reason" text;--> statement-breakpoint
ALTER TABLE "content" ADD COLUMN "dismissed_at" timestamp;--> statement-breakpoint
ALTER TABLE "content" ADD COLUMN "view_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "content" ADD COLUMN "time_spent" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "is_dismissed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "dismiss_reason" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "dismissed_at" timestamp;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "completion_rate" real;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "view_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "modules" ADD COLUMN "is_dismissed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "modules" ADD COLUMN "dismiss_reason" text;--> statement-breakpoint
ALTER TABLE "modules" ADD COLUMN "dismissed_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_banned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "banned_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login" timestamp;--> statement-breakpoint
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;