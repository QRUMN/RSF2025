-- Create reminders table for meal plan reminders
CREATE TABLE IF NOT EXISTS reminders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    meal_plan_id uuid REFERENCES meal_plans(id) ON DELETE CASCADE,
    message text NOT NULL,
    remind_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for quick lookup by user and meal plan
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_meal_plan_id ON reminders(meal_plan_id);
