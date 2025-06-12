/*
  # Services and Availability Tables

  1. New Tables
    - `services`: Available services (training, massage, consultation)
    - `availability`: Provider availability slots

  2. Security
    - Enable RLS
    - Public read access for active records
*/

-- Services
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  duration interval NOT NULL,
  price numeric NOT NULL,
  category text NOT NULL CHECK (category IN ('training', 'massage', 'consultation')),
  provider_id uuid REFERENCES service_providers(id),
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now()
);

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'services' AND policyname = 'Anyone can view active services'
  ) THEN
    ALTER TABLE services ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Anyone can view active services"
      ON services
      FOR SELECT
      USING (status = 'active');
  END IF;
END $$;

-- Availability
CREATE TABLE IF NOT EXISTS availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES service_providers(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'availability' AND policyname = 'Anyone can view availability'
  ) THEN
    ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Anyone can view availability"
      ON availability
      FOR SELECT
      USING (is_available = true);
  END IF;
END $$;

-- Create index for availability queries
CREATE INDEX IF NOT EXISTS idx_availability_provider_date 
  ON availability(provider_id, date);