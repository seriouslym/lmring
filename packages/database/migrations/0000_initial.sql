-- Initial database schema for LMRing
-- This migration creates all tables for the application with Better-Auth integration

-- ============================================================================
-- ENUMS
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE "public"."config_source" AS ENUM('manual', 'cherry-studio', 'newapi');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."message_role" AS ENUM('user', 'assistant', 'system');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."user_role" AS ENUM('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."user_status" AS ENUM('active', 'disabled', 'pending');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."vote_type" AS ENUM('like', 'neutral', 'dislike');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users table (managed by Better-Auth)
CREATE TABLE IF NOT EXISTS "public"."users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "email_verified" BOOLEAN NOT NULL DEFAULT false,
  "full_name" TEXT NOT NULL,
  "username" TEXT UNIQUE,
  "avatar_url" TEXT,
  "role" "user_role" NOT NULL DEFAULT 'user',
  "status" "user_status" NOT NULL DEFAULT 'active',
  "github_id" TEXT UNIQUE,
  "google_id" TEXT UNIQUE,
  "linuxdo_id" TEXT UNIQUE,
  "inviter_id" UUID REFERENCES "public"."users"("id"),
  "deleted_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User preferences
CREATE TABLE IF NOT EXISTS "public"."user_preferences" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" UUID NOT NULL UNIQUE REFERENCES "public"."users"("id") ON DELETE CASCADE,
  "theme" TEXT DEFAULT 'system',
  "language" TEXT DEFAULT 'en',
  "default_models" JSONB,
  "config_source" "config_source" DEFAULT 'manual',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- API keys (encrypted storage)
CREATE TABLE IF NOT EXISTS "public"."api_keys" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" UUID NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
  "provider_name" TEXT NOT NULL,
  "encrypted_key" TEXT NOT NULL,
  "config_source" "config_source" DEFAULT 'manual',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Conversations
CREATE TABLE IF NOT EXISTS "public"."conversations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" UUID NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages
CREATE TABLE IF NOT EXISTS "public"."messages" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "conversation_id" UUID NOT NULL REFERENCES "public"."conversations"("id") ON DELETE CASCADE,
  "role" "message_role" NOT NULL,
  "content" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Model responses
CREATE TABLE IF NOT EXISTS "public"."model_responses" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "message_id" UUID NOT NULL REFERENCES "public"."messages"("id") ON DELETE CASCADE,
  "model_name" TEXT NOT NULL,
  "provider_name" TEXT NOT NULL,
  "response_content" TEXT NOT NULL,
  "tokens_used" INTEGER,
  "response_time_ms" INTEGER,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User votes
CREATE TABLE IF NOT EXISTS "public"."user_votes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" UUID NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
  "message_id" UUID NOT NULL REFERENCES "public"."messages"("id") ON DELETE CASCADE,
  "model_response_id" UUID NOT NULL REFERENCES "public"."model_responses"("id") ON DELETE CASCADE,
  "vote_type" "vote_type" NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "unique_user_model_vote" UNIQUE("user_id", "model_response_id")
);

-- Model rankings
CREATE TABLE IF NOT EXISTS "public"."model_rankings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "model_name" TEXT NOT NULL,
  "provider_name" TEXT NOT NULL,
  "total_likes" INTEGER NOT NULL DEFAULT 0,
  "total_dislikes" INTEGER NOT NULL DEFAULT 0,
  "total_neutral" INTEGER NOT NULL DEFAULT 0,
  "ranking_score" REAL NOT NULL DEFAULT 0,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "model_rankings_model_provider_unique" UNIQUE("model_name", "provider_name")
);

-- Files
CREATE TABLE IF NOT EXISTS "public"."files" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" UUID NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
  "filename" TEXT NOT NULL,
  "mime_type" TEXT NOT NULL,
  "file_data" TEXT NOT NULL,
  "size_bytes" INTEGER NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shared results
CREATE TABLE IF NOT EXISTS "public"."shared_results" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "conversation_id" UUID NOT NULL REFERENCES "public"."conversations"("id") ON DELETE CASCADE,
  "share_token" TEXT NOT NULL UNIQUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "expires_at" TIMESTAMPTZ
);

-- ============================================================================
-- BETTER-AUTH TABLES
-- ============================================================================

-- Session table
CREATE TABLE IF NOT EXISTS "public"."session" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "user_id" UUID NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Account table (OAuth and email/password)
CREATE TABLE IF NOT EXISTS "public"."account" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "user_id" UUID NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
  "account_id" TEXT NOT NULL,
  "provider_id" TEXT NOT NULL,
  "access_token" TEXT,
  "access_token_expires_at" TIMESTAMPTZ,
  "refresh_token" TEXT,
  "refresh_token_expires_at" TIMESTAMPTZ,
  "id_token" TEXT,
  "expires_at" TIMESTAMPTZ,
  "scope" TEXT,
  "password" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "account_provider_account_unique" UNIQUE("provider_id", "account_id")
);

-- Verification table
CREATE TABLE IF NOT EXISTS "public"."verification" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "public"."users" ("email");
CREATE INDEX IF NOT EXISTS "users_inviter_id_idx" ON "public"."users" ("inviter_id");
CREATE INDEX IF NOT EXISTS "users_deleted_at_idx" ON "public"."users" ("deleted_at");

-- User preferences indexes
CREATE INDEX IF NOT EXISTS "user_preferences_user_id_idx" ON "public"."user_preferences" ("user_id");

-- API keys indexes
CREATE INDEX IF NOT EXISTS "api_keys_user_id_idx" ON "public"."api_keys" ("user_id");

-- Conversations indexes
CREATE INDEX IF NOT EXISTS "conversations_user_id_idx" ON "public"."conversations" ("user_id");

-- Messages indexes
CREATE INDEX IF NOT EXISTS "messages_conversation_id_idx" ON "public"."messages" ("conversation_id");

-- Model responses indexes
CREATE INDEX IF NOT EXISTS "model_responses_message_id_idx" ON "public"."model_responses" ("message_id");

-- User votes indexes
CREATE INDEX IF NOT EXISTS "user_votes_user_id_idx" ON "public"."user_votes" ("user_id");
CREATE INDEX IF NOT EXISTS "user_votes_message_id_idx" ON "public"."user_votes" ("message_id");
CREATE INDEX IF NOT EXISTS "user_votes_model_response_id_idx" ON "public"."user_votes" ("model_response_id");

-- Model rankings indexes
CREATE INDEX IF NOT EXISTS "model_rankings_ranking_score_idx" ON "public"."model_rankings" ("ranking_score");

-- Files indexes
CREATE INDEX IF NOT EXISTS "files_user_id_idx" ON "public"."files" ("user_id");

-- Shared results indexes
CREATE INDEX IF NOT EXISTS "shared_results_share_token_idx" ON "public"."shared_results" ("share_token");
CREATE INDEX IF NOT EXISTS "shared_results_conversation_id_idx" ON "public"."shared_results" ("conversation_id");

-- Session indexes
CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "public"."session" ("user_id");

-- Account indexes
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "public"."account" ("user_id");

-- Verification indexes
CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "public"."verification" ("identifier");

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at for session table
CREATE OR REPLACE FUNCTION update_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS session_updated_at_trigger ON "public"."session";
CREATE TRIGGER session_updated_at_trigger
  BEFORE UPDATE ON "public"."session"
  FOR EACH ROW
  EXECUTE FUNCTION update_session_updated_at();

-- Auto-update updated_at for account table
CREATE OR REPLACE FUNCTION update_account_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS account_updated_at_trigger ON "public"."account";
CREATE TRIGGER account_updated_at_trigger
  BEFORE UPDATE ON "public"."account"
  FOR EACH ROW
  EXECUTE FUNCTION update_account_updated_at();

-- Auto-update updated_at for verification table
CREATE OR REPLACE FUNCTION update_verification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS verification_updated_at_trigger ON "public"."verification";
CREATE TRIGGER verification_updated_at_trigger
  BEFORE UPDATE ON "public"."verification"
  FOR EACH ROW
  EXECUTE FUNCTION update_verification_updated_at();
