-- MIGRATION: Enforce snake_case and add missing columns/constraints
-- BOOKINGS TABLE
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='userId') THEN
    ALTER TABLE bookings RENAME COLUMN "userId" TO user_id;
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='serviceId') THEN
    ALTER TABLE bookings RENAME COLUMN "serviceId" TO service_id;
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='providerId') THEN
    ALTER TABLE bookings RENAME COLUMN "providerId" TO provider_id;
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='createdAt') THEN
    ALTER TABLE bookings RENAME COLUMN "createdAt" TO created_at;
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='updatedAt') THEN
    ALTER TABLE bookings RENAME COLUMN "updatedAt" TO updated_at;
  END IF;
END $$;

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_id uuid;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS provider_id uuid;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE bookings ADD CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE bookings ADD CONSTRAINT fk_bookings_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL;

-- SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id text NOT NULL,
  price numeric,
  status text,
  started_at timestamptz,
  cancelled_at timestamptz,
  renewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='userId') THEN
    ALTER TABLE subscriptions RENAME COLUMN "userId" TO user_id;
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='planId') THEN
    ALTER TABLE subscriptions RENAME COLUMN "planId" TO plan_id;
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='startedAt') THEN
    ALTER TABLE subscriptions RENAME COLUMN "startedAt" TO started_at;
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='cancelledAt') THEN
    ALTER TABLE subscriptions RENAME COLUMN "cancelledAt" TO cancelled_at;
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='renewedAt') THEN
    ALTER TABLE subscriptions RENAME COLUMN "renewedAt" TO renewed_at;
  END IF;
END $$;

ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_id text;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS price numeric;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS started_at timestamptz;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS renewed_at timestamptz;

ALTER TABLE subscriptions ADD CONSTRAINT fk_subscriptions_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- SERVICES TABLE
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='createdAt') THEN
    ALTER TABLE services RENAME COLUMN "createdAt" TO created_at;
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='updatedAt') THEN
    ALTER TABLE services RENAME COLUMN "updatedAt" TO updated_at;
  END IF;
END $$;
ALTER TABLE services ADD COLUMN IF NOT EXISTS price numeric;
ALTER TABLE services ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS name text;

-- PAYMENT_METHODS TABLE
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_methods' AND column_name='userId') THEN
    ALTER TABLE payment_methods RENAME COLUMN "userId" TO user_id;
  END IF;
END $$;
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false;
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE payment_methods ADD CONSTRAINT fk_payment_methods_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- POSITIONS FOR ADMINS
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS positions text[];

-- TRIGGERS AND INDEXES (EXAMPLES)
CREATE OR REPLACE FUNCTION handle_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION handle_bookings_updated_at();

CREATE INDEX IF NOT EXISTS idx_bookings_user_date ON bookings (user_id, date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_plan ON subscriptions (user_id, plan_id);
