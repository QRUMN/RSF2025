/*
  # Fix profiles table RLS policies

  1. Changes
    - Drop existing RLS policies for profiles table
    - Add new policies that properly handle profile creation and updates
    - Ensure authenticated users can:
      - Create their own profile
      - Update their own profile
      - View their own profile

  2. Security
    - Enable RLS on profiles table
    - Add policies for authenticated users only
    - Restrict access to own profile data only
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Create new policies
CREATE POLICY "Enable insert for authenticated users only"
ON profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id"
ON profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable read access for users based on id"
ON profiles FOR SELECT TO authenticated
USING (auth.uid() = id);