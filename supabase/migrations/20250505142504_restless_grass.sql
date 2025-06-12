/*
  # Add Member Features Tables and Policies

  1. New Tables
    - Progress photos for visual tracking
    - Nutrition logs for meal tracking
    - Body measurements tracking
    - Workout logging system

  2. Security
    - RLS enabled on all tables
    - Policies for user data access control

  3. Indexes
    - Optimized for user and date-based queries
*/

-- Progress Photos
CREATE TABLE IF NOT EXISTS progress_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  photo_date date DEFAULT CURRENT_DATE NOT NULL,
  category text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_progress_photos_user_date ON progress_photos(user_id, photo_date);

ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'progress_photos' AND policyname = 'Users can insert own progress photos'
  ) THEN
    CREATE POLICY "Users can insert own progress photos"
      ON progress_photos
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'progress_photos' AND policyname = 'Users can view own progress photos'
  ) THEN
    CREATE POLICY "Users can view own progress photos"
      ON progress_photos
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Nutrition Logs
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  log_date date DEFAULT CURRENT_DATE NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_date ON nutrition_logs(user_id, log_date);

ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'nutrition_logs' AND policyname = 'Users can insert own nutrition logs'
  ) THEN
    CREATE POLICY "Users can insert own nutrition logs"
      ON nutrition_logs
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'nutrition_logs' AND policyname = 'Users can update own nutrition logs'
  ) THEN
    CREATE POLICY "Users can update own nutrition logs"
      ON nutrition_logs
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'nutrition_logs' AND policyname = 'Users can view own nutrition logs'
  ) THEN
    CREATE POLICY "Users can view own nutrition logs"
      ON nutrition_logs
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Measurements
CREATE TABLE IF NOT EXISTS measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  measurement_date date DEFAULT CURRENT_DATE NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_measurements_user_date ON measurements(user_id, measurement_date);

ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'measurements' AND policyname = 'Users can insert own measurements'
  ) THEN
    CREATE POLICY "Users can insert own measurements"
      ON measurements
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'measurements' AND policyname = 'Users can view own measurements'
  ) THEN
    CREATE POLICY "Users can view own measurements"
      ON measurements
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Workout Logs
CREATE TABLE IF NOT EXISTS workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  workout_date date DEFAULT CURRENT_DATE NOT NULL,
  workout_type text NOT NULL,
  duration interval,
  calories_burned integer,
  notes text,
  exercises jsonb DEFAULT '[]'::jsonb,
  rating smallint CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date ON workout_logs(user_id, workout_date);

ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'workout_logs' AND policyname = 'Users can insert own workout logs'
  ) THEN
    CREATE POLICY "Users can insert own workout logs"
      ON workout_logs
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'workout_logs' AND policyname = 'Users can update own workout logs'
  ) THEN
    CREATE POLICY "Users can update own workout logs"
      ON workout_logs
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'workout_logs' AND policyname = 'Users can view own workout logs'
  ) THEN
    CREATE POLICY "Users can view own workout logs"
      ON workout_logs
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Update trigger for workout_logs
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_workout_logs_updated_at ON workout_logs;
CREATE TRIGGER update_workout_logs_updated_at
  BEFORE UPDATE ON workout_logs
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();