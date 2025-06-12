/*
  # Add missing profile columns

  1. Changes
    - Add missing columns to profiles table:
      - city (text)
      - state (text)
      - phone (text)
      - date_of_birth (date)
      - gender (text with check constraint)
      - fitness_goals (text array)
      - fitness_level (text with check constraint)
      - dietary_restrictions (text array)
      - preferred_workout_times (text array)

  2. Security
    - No changes to RLS policies needed as existing policies cover new columns
*/

-- Add missing columns to profiles table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'city'
  ) THEN
    ALTER TABLE profiles ADD COLUMN city text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'state'
  ) THEN
    ALTER TABLE profiles ADD COLUMN state text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE profiles ADD COLUMN date_of_birth date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'gender'
  ) THEN
    ALTER TABLE profiles ADD COLUMN gender text;
    ALTER TABLE profiles ADD CONSTRAINT profiles_gender_check 
      CHECK (gender = ANY (ARRAY['male', 'female', 'other', 'prefer-not-to-say']));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'fitness_goals'
  ) THEN
    ALTER TABLE profiles ADD COLUMN fitness_goals text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'fitness_level'
  ) THEN
    ALTER TABLE profiles ADD COLUMN fitness_level text;
    ALTER TABLE profiles ADD CONSTRAINT profiles_fitness_level_check 
      CHECK (fitness_level = ANY (ARRAY['beginner', 'intermediate', 'advanced']));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'dietary_restrictions'
  ) THEN
    ALTER TABLE profiles ADD COLUMN dietary_restrictions text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'preferred_workout_times'
  ) THEN
    ALTER TABLE profiles ADD COLUMN preferred_workout_times text[];
  END IF;
END $$;