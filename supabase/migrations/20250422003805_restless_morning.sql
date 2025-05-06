/*
  # Enhanced User Profiles Schema

  1. Updates to Profiles Table
    - Added fields:
      - `avatar_url` (text): Store user profile picture URL
      - `bio` (text): User's personal bio/description
      - `social_links` (jsonb): Store social media links
      - `notification_preferences` (jsonb): User notification settings
      - `measurement_unit` (text): Preferred unit system (metric/imperial)
      - `goals_progress` (jsonb): Track progress towards fitness goals
      - `availability` (jsonb): Weekly availability schedule
      - `certifications` (text[]): Fitness certifications
      - `injuries` (text[]): Past or current injuries
      - `equipment_access` (text[]): Available fitness equipment

  2. New Tables
    - `workout_logs`: Track workout history
    - `measurements`: Track body measurements over time
    - `nutrition_logs`: Track daily nutrition
    - `progress_photos`: Store transformation photos
    
  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{}'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS measurement_unit text CHECK (measurement_unit IN ('metric', 'imperial')) DEFAULT 'metric';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS goals_progress jsonb DEFAULT '{}'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS availability jsonb DEFAULT '{}'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS certifications text[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS injuries text[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS equipment_access text[];

-- Create workout_logs table
CREATE TABLE IF NOT EXISTS workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  workout_date date NOT NULL DEFAULT CURRENT_DATE,
  workout_type text NOT NULL,
  duration interval,
  calories_burned integer,
  notes text,
  exercises jsonb DEFAULT '[]'::jsonb,
  rating smallint CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create measurements table
CREATE TABLE IF NOT EXISTS measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  measurement_date date NOT NULL DEFAULT CURRENT_DATE,
  weight numeric,
  body_fat_percentage numeric,
  chest numeric,
  waist numeric,
  hips numeric,
  biceps numeric,
  thighs numeric,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create nutrition_logs table
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  meal_type text NOT NULL,
  foods jsonb NOT NULL,
  total_calories integer,
  protein numeric,
  carbs numeric,
  fats numeric,
  water_intake numeric,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create progress_photos table
CREATE TABLE IF NOT EXISTS progress_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  photo_url text NOT NULL,
  photo_date date NOT NULL DEFAULT CURRENT_DATE,
  category text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for workout_logs
CREATE POLICY "Users can view own workout logs"
  ON workout_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout logs"
  ON workout_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout logs"
  ON workout_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for measurements
CREATE POLICY "Users can view own measurements"
  ON measurements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own measurements"
  ON measurements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for nutrition_logs
CREATE POLICY "Users can view own nutrition logs"
  ON nutrition_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition logs"
  ON nutrition_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition logs"
  ON nutrition_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for progress_photos
CREATE POLICY "Users can view own progress photos"
  ON progress_photos
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress photos"
  ON progress_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_workout_logs_updated_at
  BEFORE UPDATE ON workout_logs
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date ON workout_logs (user_id, workout_date);
CREATE INDEX IF NOT EXISTS idx_measurements_user_date ON measurements (user_id, measurement_date);
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_date ON nutrition_logs (user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_progress_photos_user_date ON progress_photos (user_id, photo_date);