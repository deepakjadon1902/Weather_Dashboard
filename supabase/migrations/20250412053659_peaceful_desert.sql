/*
  # Create users and alerts tables

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - matches auth.users id
      - `phone_number` (text, nullable) - for SMS notifications
      - `created_at` (timestamp with time zone)
    
    - `alerts` (already exists but needs to be recreated with proper relations)
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users.id)
      - `location` (text)
      - `condition` (text)
      - `method` (text)
      - `created_at` (timestamp with time zone)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create trigger to automatically create user record
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Drop and recreate alerts table with proper relations
DROP TABLE IF EXISTS public.alerts;

CREATE TABLE public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  location text NOT NULL,
  condition text NOT NULL,
  method text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on alerts table
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Policies for alerts table
CREATE POLICY "Users can create their own alerts"
  ON public.alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own alerts"
  ON public.alerts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts"
  ON public.alerts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);