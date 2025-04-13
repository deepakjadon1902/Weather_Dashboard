/*
  # Create alerts table for weather notifications

  1. New Tables
    - `alerts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `location` (text)
      - `condition` (text)
      - `method` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `alerts` table
    - Add policies for users to manage their own alerts
*/

CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  location text NOT NULL,
  condition text NOT NULL,
  method text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own alerts"
  ON alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own alerts"
  ON alerts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
  ON alerts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);