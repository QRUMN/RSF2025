-- Migration (superseded by 20250506095000_meal_planning_schema.sql)
-- The meal_plans and meal_plan_items tables are now implemented in a more advanced form.
-- This migration is left empty to avoid conflicts with the new schema.
-- (Old code commented out below for reference)

/*
-- Table: meal_plans
-- create table if not exists meal_plans (
--     id uuid primary key default gen_random_uuid(),
--     title text not null,
--     notes text,
--     client_id uuid not null references users(id) on delete cascade,
--     created_by uuid not null references profiles(id) on delete set null,
--     created_at timestamp with time zone default timezone('utc', now()),
--     updated_at timestamp with time zone default timezone('utc', now())
-- );

-- Table: meal_plan_items
-- create table if not exists meal_plan_items (
--     id uuid primary key default gen_random_uuid(),
--     meal_plan_id uuid not null references meal_plans(id) on delete cascade,
--     day integer not null, -- e.g., 1 for Day 1, 2 for Day 2, etc.
--     meal_type text not null, -- e.g., Breakfast, Lunch, Dinner
--     description text not null,
--     "order" integer default 0,
--     created_at timestamp with time zone default timezone('utc', now())
-- );

-- Indexes for performance
-- create index if not exists idx_meal_plan_client on meal_plans(client_id);
-- create index if not exists idx_meal_plan_items_plan on meal_plan_items(meal_plan_id);
*/

