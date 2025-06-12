/*
  # Add Services and Availability Tables

  1. New Tables
    - `services`: Available services like training, massage, consultation
    - `availability`: Provider availability slots
  
  2. Security
    - Enable RLS on all tables
    - Add policies for public access to active services and availability
*/

-- Services
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'services'
  ) THEN
    CREATE TABLE services (
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

    ALTER TABLE services ENABLE ROW LEVEL SECURITY;

    DO $policy$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'services' 
        AND policyname = 'Anyone can view active services'
      ) THEN
        CREATE POLICY "Anyone can view active services"
          ON services
          FOR SELECT
          USING (status = 'active');
      END IF;
    END $policy$;
  END IF;
END $$;

-- Availability
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'availability'
  ) THEN
    CREATE TABLE availability (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      provider_id uuid REFERENCES service_providers(id) ON DELETE CASCADE,
      date date NOT NULL,
      start_time time NOT NULL,
      end_time time NOT NULL,
      is_available boolean DEFAULT true,
      created_at timestamptz DEFAULT now(),
      CONSTRAINT valid_time_range CHECK (start_time < end_time)
    );

    CREATE INDEX idx_availability_provider_date ON availability(provider_id, date);

    ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

    DO $policy$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'availability' 
        AND policyname = 'Anyone can view availability'
      ) THEN
        CREATE POLICY "Anyone can view availability"
          ON availability
          FOR SELECT
          USING (is_available = true);
      END IF;
    END $policy$;
  END IF;
END $$;