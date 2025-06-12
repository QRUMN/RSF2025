/*
  # Create Super Admin Record

  1. Changes
    - Create admin record for super admin user
    - Set appropriate role and status
*/

-- Create admin record if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM admins 
    WHERE email = 'readysetfitrx@gmail.com' AND role = 'super_admin'
  ) THEN
    -- Insert admin record
    INSERT INTO admins (id, email, role, status)
    SELECT 
      id,
      'readysetfitrx@gmail.com',
      'super_admin',
      'active'
    FROM auth.users
    WHERE email = 'readysetfitrx@gmail.com'
    LIMIT 1;
  END IF;
END $$;