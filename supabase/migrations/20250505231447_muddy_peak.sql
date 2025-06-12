/*
  # Create Super Admin Account

  1. Create user in auth.users if not exists
  2. Create admin record in admins table
  3. Set role as super_admin with active status
*/

-- First create the user in auth.users if it doesn't exist
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

-- Then create the admin record
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