CREATE TABLE "user_custom_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"api_key_id" uuid NOT NULL,
	"model_id" text NOT NULL,
	"display_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_custom_models_api_key_model_unique" UNIQUE("api_key_id","model_id")
);
--> statement-breakpoint
ALTER TABLE "user_custom_models" ADD CONSTRAINT "user_custom_models_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_custom_models" ADD CONSTRAINT "user_custom_models_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_custom_models_user_id_idx" ON "user_custom_models" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_custom_models_api_key_id_idx" ON "user_custom_models" USING btree ("api_key_id");