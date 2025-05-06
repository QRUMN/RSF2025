/*
  # Add Service Providers Table

  1. New Table
    - `service_providers`
      - Core table for storing trainer and service provider information
      - Includes name, title, bio, specialties, etc.
      - Status tracking for active/inactive providers

  2. Security
    - RLS enabled
    - Public read access for active providers only
*/

-- Service Providers
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'service_providers'
  ) THEN
    CREATE TABLE service_providers (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      title text NOT NULL,
      bio text,
      specialties text[],
      image_url text,
      status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      created_at timestamptz DEFAULT now()
    );

    ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;

    DO $policy$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'service_providers' 
        AND policyname = 'Anyone can view active service providers'
      ) THEN
        CREATE POLICY "Anyone can view active service providers"
          ON service_providers
          FOR SELECT
          USING (status = 'active');
      END IF;
    END $policy$;
  END IF;
END $$;