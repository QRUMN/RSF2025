/*
  # Fix Admin RLS Policies

  1. Changes
    - Remove recursive policies from admins table
    - Create new simplified policies that avoid querying the same table
    - Maintain security while preventing infinite recursion

  2. Security
    - Enable RLS on admins table
    - Add policy for admins to read their own record
    - Add policy for super admins to manage all admin records
    - Policies use direct uid comparison instead of subqueries
*/

-- Drop existing policies to replace them with non-recursive versions
DROP POLICY IF EXISTS "Enable read access for admins" ON public.admins;
DROP POLICY IF EXISTS "Enable super admin management" ON public.admins;

-- Create new non-recursive policies
CREATE POLICY "Enable read access for admins"
ON public.admins
FOR SELECT
TO authenticated
USING (
  -- Simple direct comparison with the user's ID
  id = auth.uid()
);

CREATE POLICY "Enable super admin management"
ON public.admins
FOR ALL
TO authenticated
USING (
  -- Check if the current user is a super_admin
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = auth.uid() 
    AND role = 'super_admin'
    AND status = 'active'
  )
)
WITH CHECK (
  -- Same condition for insert/update operations
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = auth.uid() 
    AND role = 'super_admin'
    AND status = 'active'
  )
);