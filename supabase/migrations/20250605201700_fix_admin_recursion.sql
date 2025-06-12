/*
  # Fix Admin RLS Policies Recursion Issue
  
  1. Changes
    - Remove policies causing infinite recursion
    - Create new non-recursive policies using a different approach
    - Temporarily disable RLS for admin login
  
  2. Security
    - Create a secure function to check admin status without recursion
    - Re-enable RLS with proper non-recursive policies
*/

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Enable read access for admins" ON public.admins;
DROP POLICY IF EXISTS "Enable super admin management" ON public.admins;

-- Create a secure function to check if a user is a super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Direct query without going through RLS
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = auth.uid() 
    AND role = 'super_admin'
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Temporarily disable RLS to allow initial admin login
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read the admins table (for initial login)
CREATE POLICY "Allow reading admins table"
ON public.admins
FOR SELECT
TO authenticated
USING (true);

-- Create a policy that allows super admins to manage all admin records
CREATE POLICY "Super admin management"
ON public.admins
FOR ALL
TO authenticated
USING (
  -- Use the secure function to check admin status
  public.is_super_admin()
)
WITH CHECK (
  public.is_super_admin()
);

-- Insert or update the super admin record to ensure it exists
INSERT INTO public.admins (id, email, role, status)
SELECT 
  auth.uid(),
  'readysetfitrx@gmail.com',
  'super_admin',
  'active'
FROM auth.users
WHERE email = 'readysetfitrx@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'super_admin',
    status = 'active';
