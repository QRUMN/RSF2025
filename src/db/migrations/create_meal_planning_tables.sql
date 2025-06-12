-- Create meal planning tables

-- Table for meal plans
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  client_id UUID REFERENCES auth.users(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  calories_target INTEGER,
  protein_target INTEGER,
  carbs_target INTEGER,
  fat_target INTEGER,
  status VARCHAR(50) DEFAULT 'draft', -- draft, active, completed, archived
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for meal plan days
CREATE TABLE IF NOT EXISTS meal_plan_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  day_date DATE NOT NULL,
  notes TEXT,
  total_calories INTEGER,
  total_protein INTEGER,
  total_carbs INTEGER,
  total_fat INTEGER
);

-- Table for meals
CREATE TABLE IF NOT EXISTS meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_plan_day_id UUID REFERENCES meal_plan_days(id) ON DELETE CASCADE,
  meal_type VARCHAR(50) NOT NULL, -- breakfast, lunch, dinner, snack
  time_of_day TIME,
  notes TEXT,
  total_calories INTEGER,
  total_protein INTEGER,
  total_carbs INTEGER,
  total_fat INTEGER
);

-- Table for food items reference database
CREATE TABLE IF NOT EXISTS food_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  calories_per_100g INTEGER,
  protein_per_100g INTEGER,
  carbs_per_100g INTEGER,
  fat_per_100g INTEGER,
  serving_size DECIMAL(10,2),
  serving_unit VARCHAR(50),
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for meal items (foods in a meal)
CREATE TABLE IF NOT EXISTS meal_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id UUID REFERENCES meals(id) ON DELETE CASCADE,
  food_item_id UUID REFERENCES food_items(id),
  custom_food_name VARCHAR(255),
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  calories INTEGER,
  protein INTEGER,
  carbs INTEGER,
  fat INTEGER,
  notes TEXT
);

-- Table for meal plan comments
CREATE TABLE IF NOT EXISTS meal_plan_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for meal completions tracking
CREATE TABLE IF NOT EXISTS meal_plan_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id UUID REFERENCES meals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  completed BOOLEAN DEFAULT false,
  completion_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  photo_url TEXT
);

-- Add RLS policies for meal plans
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can do everything" ON meal_plans 
  FOR ALL 
  TO authenticated 
  USING (auth.uid() IN (SELECT user_id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Users can view their own meal plans" ON meal_plans 
  FOR SELECT 
  TO authenticated 
  USING (client_id = auth.uid());

-- Add RLS policies for meal plan days
ALTER TABLE meal_plan_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can do everything" ON meal_plan_days 
  FOR ALL 
  TO authenticated 
  USING (auth.uid() IN (SELECT user_id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Users can view their own meal plan days" ON meal_plan_days 
  FOR SELECT 
  TO authenticated 
  USING (meal_plan_id IN (SELECT id FROM meal_plans WHERE client_id = auth.uid()));

-- Add similar RLS policies for other tables
-- (Simplified for brevity, but would follow same pattern)
