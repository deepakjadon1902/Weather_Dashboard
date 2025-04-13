/*
  # Add premium features support

  1. Changes
    - Add subscription_tier to users table
    - Add air_quality and uv_index columns to alerts table
    - Add historical_data table for premium users
    - Add weather_maps table for saved locations

  2. Security
    - Enable RLS on new tables
    - Add policies for premium features
*/

-- Add subscription tier to users
ALTER TABLE public.users
ADD COLUMN subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'professional'));

-- Add new columns to alerts table
ALTER TABLE public.alerts
ADD COLUMN air_quality boolean DEFAULT false,
ADD COLUMN uv_index boolean DEFAULT false;

-- Create historical data table
CREATE TABLE public.historical_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  location text NOT NULL,
  date date NOT NULL,
  temperature numeric NOT NULL,
  humidity numeric,
  wind_speed numeric,
  precipitation numeric,
  created_at timestamptz DEFAULT now()
);

-- Create weather maps table
CREATE TABLE public.weather_maps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  location text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.historical_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_maps ENABLE ROW LEVEL SECURITY;

-- Policies for historical data
CREATE POLICY "Users can insert own historical data"
  ON public.historical_data
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND subscription_tier IN ('premium', 'professional')
    )
  );

CREATE POLICY "Users can view own historical data"
  ON public.historical_data
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND subscription_tier IN ('premium', 'professional')
    )
  );

-- Policies for weather maps
CREATE POLICY "Users can manage weather maps"
  ON public.weather_maps
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);