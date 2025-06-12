/*
  # Create default admin account

  1. Changes
    - Insert default admin user into auth.users
    - Insert corresponding admin record into public.admins
    
  2. Security
    - Password is hashed using Supabase's built-in password hashing
    - Admin role is set to 'super_admin'
    - Status is set to 'active'
*/

-- First create the admin user in auth.users
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
  'admin@example.com',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'admin@example.com'
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
WHERE email = 'admin@example.com'
AND NOT EXISTS (
  SELECT 1 FROM public.admins WHERE email = 'admin@example.com'
);