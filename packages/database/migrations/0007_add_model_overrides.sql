-- Add new columns to user_custom_models table
ALTER TABLE "user_custom_models" ADD COLUMN "group_name" text;
ALTER TABLE "user_custom_models" ADD COLUMN "abilities" jsonb;
ALTER TABLE "user_custom_models" ADD COLUMN "supports_streaming" boolean;
ALTER TABLE "user_custom_models" ADD COLUMN "price_currency" text;
ALTER TABLE "user_custom_models" ADD COLUMN "input_price" real;
ALTER TABLE "user_custom_models" ADD COLUMN "output_price" real;

-- Create user_model_overrides table for storing user customizations of default models
CREATE TABLE IF NOT EXISTS "user_model_overrides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"api_key_id" uuid NOT NULL,
	"model_id" text NOT NULL,
	"display_name" text,
	"group_name" text,
	"abilities" jsonb,
	"supports_streaming" boolean,
	"price_currency" text,
	"input_price" real,
	"output_price" real,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Add foreign key constraints
ALTER TABLE "user_model_overrides" ADD CONSTRAINT "user_model_overrides_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_model_overrides" ADD CONSTRAINT "user_model_overrides_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE cascade ON UPDATE no action;

-- Add indexes
CREATE INDEX IF NOT EXISTS "user_model_overrides_user_id_idx" ON "user_model_overrides" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "user_model_overrides_api_key_id_idx" ON "user_model_overrides" USING btree ("api_key_id");

-- Add unique constraint
ALTER TABLE "user_model_overrides" ADD CONSTRAINT "user_model_overrides_api_key_model_unique" UNIQUE("api_key_id","model_id");

