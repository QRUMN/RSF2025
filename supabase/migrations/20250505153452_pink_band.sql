/*
  # Add Meal Plans Table

  1. New Table
    - `meal_plans`
      - For coach-created meal plans assigned to users
      - Stores complete weekly meal plans with nutritional info
      - Includes coach suggestions and notes

  2. Security
    - Enable RLS
    - Add policies for authenticated users and coaches
*/

-- Create meal_plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id uuid REFERENCES service_providers(id),
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  daily_plans jsonb NOT NULL,
  coach_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (start_date <= end_date)
);

-- Create index for efficient queries
CREATE INDEX idx_meal_plans_user_date ON meal_plans(user_id, start_date, end_date);

-- Enable RLS
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own meal plans"
  ON meal_plans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Coaches can manage assigned meal plans"
  ON meal_plans
  FOR ALL
  TO authenticated
  USING (
    auth.uid()::text IN (
      SELECT id::text 
      FROM service_providers 
      WHERE id = coach_id
    )
  )
  WITH CHECK (
    auth.uid()::text IN (
      SELECT id::text 
      FROM service_providers 
      WHERE id = coach_id
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();