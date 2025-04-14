ALTER TABLE "content" ADD COLUMN IF NOT EXISTS "cloudinary_id" TEXT;

-- Optionally, if you want to populate existing records:
UPDATE "content"
SET "cloudinary_id" = SUBSTRING(file_url FROM 'skillarious/[^/]+/[^.]+')
WHERE "file_url" LIKE '%skillarious%';