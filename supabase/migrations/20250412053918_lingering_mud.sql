/*
  # Add INSERT policy for users table

  1. Changes
    - Add policy to allow authenticated users to insert their own records
    - This fixes the RLS violation error when creating user records

  2. Security
    - Users can only insert records with their own ID
    - Maintains existing RLS policies for SELECT and UPDATE
*/

CREATE POLICY "Users can insert own data"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);