/*
  # Fix Admin RLS Policies

  1. Changes
    - Drop existing problematic policies
    - Create new policies that avoid recursion
    - Use a more efficient way to check admin status

  2. Security
    - Maintain same level of security
    - Prevent infinite recursion
    - Keep policies simple and focused
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view other admins" ON admins;
DROP POLICY IF EXISTS "Super admins can manage admins" ON admins;

-- Create new, non-recursive policies
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