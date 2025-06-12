-- 90-Day Meal Planning Schema for Ready Set Fit (RSF)
-- All FKs to client_id point to profiles(id)

-- meal_plans: High-level meal plan (assigned by admin/nutritionist)
CREATE TABLE IF NOT EXISTS meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admins(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- meal_plan_days: Each day in a 90-day plan
CREATE TABLE IF NOT EXISTS meal_plan_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id uuid REFERENCES meal_plans(id) ON DELETE CASCADE,
  day_number integer NOT NULL CHECK (day_number >= 1 AND day_number <= 90),
  date date,
  total_calories integer,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- meals: Meals per day (breakfast/lunch/dinner/snack)
CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_day_id uuid REFERENCES meal_plan_days(id) ON DELETE CASCADE,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  title text,
  description text,
  serving_size text,
  created_at timestamptz DEFAULT now()
);

-- food_items: Food catalog
CREATE TABLE IF NOT EXISTS food_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  calories_per_unit numeric,
  protein_grams numeric,
  carbs_grams numeric,
  fat_grams numeric,
  standard_unit text,
  food_category text
);

-- meal_items: Foods in a meal
CREATE TABLE IF NOT EXISTS meal_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id uuid REFERENCES meals(id) ON DELETE CASCADE,
  food_id uuid REFERENCES food_items(id) ON DELETE SET NULL,
  quantity numeric,
  unit text,
  preparation_notes text
);

-- client_meal_plans: Assign plan to client
CREATE TABLE IF NOT EXISTS client_meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  meal_plan_id uuid REFERENCES meal_plans(id) ON DELETE CASCADE,
  start_date date,
  end_date date,
  status text DEFAULT 'active',
  UNIQUE (client_id, meal_plan_id)
);

-- nutritional_requirements: Client's nutrition goals
CREATE TABLE IF NOT EXISTS nutritional_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  daily_calorie_target integer,
  protein_target_grams numeric,
  carbs_target_grams numeric,
  fat_target_grams numeric
);

-- meal_compliance: Track client adherence to plan
CREATE TABLE IF NOT EXISTS meal_compliance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  meal_plan_day_id uuid REFERENCES meal_plan_days(id) ON DELETE CASCADE,
  compliance_status text,
  notes text,
  recorded_at timestamptz DEFAULT now()
);

-- dietary_restrictions: Client restrictions
CREATE TABLE IF NOT EXISTS dietary_restrictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  restriction_type text NOT NULL,
  food_item_id uuid REFERENCES food_items(id),
  description text,
  severity text
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_meal_plans_client ON client_meal_plans(client_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_days_plan ON meal_plan_days(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_meals_day ON meals(meal_plan_day_id);
CREATE INDEX IF NOT EXISTS idx_meal_items_meal ON meal_items(meal_id);
CREATE INDEX IF NOT EXISTS idx_meal_compliance_client_day ON meal_compliance(client_id, meal_plan_day_id);

-- Enable RLS and add policies as needed after confirming table creation
