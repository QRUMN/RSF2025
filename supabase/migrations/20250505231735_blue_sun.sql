/*
  # Fix Admin RLS and Add Super Admin

  1. Drop existing recursive policies
  2. Create new, optimized policies
  3. Add super admin account
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for admins" ON admins;
DROP POLICY IF EXISTS "Enable super admin management" ON admins;

-- Create new, optimized policies
CREATE POLICY "Enable read access for admins"
ON admins FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins a
    WHERE a.id = auth.uid()
    AND a.status = 'active'
  )
);

CREATE POLICY "Enable super admin management"
ON admins FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins a
    WHERE a.id = auth.uid()
    AND a.role = 'super_admin'
    AND a.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admins a
    WHERE a.id = auth.uid()
    AND a.role = 'super_admin'
    AND a.status = 'active'
  )
);

-- Create super admin account if it doesn't exist
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  last_sign_in_at
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'readysetfitrx@gmail.com',
  crypt('@GetFit2026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'readysetfitrx@gmail.com'
);

-- Add admin record for the super admin
INSERT INTO public.admins (
  id,
  email,
  role,
  status,
  created_at,
  updated_at
)
SELECT
  id,
  email,
  'super_admin',
  'active',
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'readysetfitrx@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.admins WHERE email = 'readysetfitrx@gmail.com'
);