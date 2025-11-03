-- Create a function to generate random alphanumeric TEXT IDs (similar to Better-Auth's format)
CREATE OR REPLACE FUNCTION generate_text_id(length INTEGER DEFAULT 32)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
  chars_length INTEGER;
BEGIN
  chars_length := length(chars);
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * chars_length + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add default TEXT ID generation to Better-Auth tables
ALTER TABLE "verification" ALTER COLUMN "id" SET DEFAULT generate_text_id(32);
ALTER TABLE "session" ALTER COLUMN "id" SET DEFAULT generate_text_id(32);
ALTER TABLE "account" ALTER COLUMN "id" SET DEFAULT generate_text_id(32);
