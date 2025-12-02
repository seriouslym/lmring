-- Add proxy_url column to api_keys table
ALTER TABLE "public"."api_keys" ADD COLUMN IF NOT EXISTS "proxy_url" TEXT;
