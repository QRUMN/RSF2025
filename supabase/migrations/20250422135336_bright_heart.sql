/*
  # Add email column to profiles table

  1. Changes
    - Add `email` column to `profiles` table
      - Type: text
      - Nullable: true (since email is already stored in auth.users)
      - Description: User's email address
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email text;
  END IF;
END $$;