ALTER TABLE "otps" ADD COLUMN "last_sent" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "refresh_token" text;