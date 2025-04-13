/*
  # Add phone number support for SMS notifications

  1. Changes
    - Add phone_number column to auth.users table
    - Add phone_number validation trigger
*/

ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS phone_number text;

-- Function to validate phone number format
CREATE OR REPLACE FUNCTION validate_phone_number()
RETURNS trigger AS $$
BEGIN
  IF NEW.phone_number IS NOT NULL AND NEW.phone_number !~ '^\+[1-9]\d{1,14}$' THEN
    RAISE EXCEPTION 'Invalid phone number format. Must start with + and contain 1-15 digits';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate phone number before insert or update
DROP TRIGGER IF EXISTS validate_phone_number_trigger ON auth.users;
CREATE TRIGGER validate_phone_number_trigger
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION validate_phone_number();