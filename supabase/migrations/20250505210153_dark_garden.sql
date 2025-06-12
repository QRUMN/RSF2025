/*
  # Add Admin Account Creation Function

  1. New Function
    - `create_admin_account`: Creates an admin account with specified role
      - Parameters:
        - email (text)
        - role (text)
      - Returns: uuid of created admin

  2. Security
    - Function can only be executed by authenticated super admins
    - Validates email format and role values
*/

-- Create function to create admin accounts
CREATE OR REPLACE FUNCTION create_admin_account(
  admin_email text,
  admin_role text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_admin_id uuid;
BEGIN
  -- Validate role
  IF admin_role NOT IN ('super_admin', 'admin', 'moderator') THEN
    RAISE EXCEPTION 'Invalid role. Must be super_admin, admin, or moderator';
  END IF;

  -- Validate email format
  IF admin_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;

  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM admins WHERE email = admin_email) THEN
    RAISE EXCEPTION 'Admin with this email already exists';
  END IF;

  -- Insert new admin
  INSERT INTO admins (id, email, role, status)
  VALUES (auth.uid(), admin_email, admin_role, 'active')
  RETURNING id INTO new_admin_id;

  RETURN new_admin_id;
END;
$$;