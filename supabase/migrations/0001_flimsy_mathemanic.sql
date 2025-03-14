ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "is_educator" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "verified" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "otps" ADD COLUMN "last_sent" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "refresh_token" text DEFAULT null;