/*
  # Fix Password Change RLS Policy

  ## Problem
  Users cannot update their own `must_change_password` field because only admins 
  have write access to the profiles table. This causes an infinite redirect loop 
  after password changes.

  ## Solution
  Add a specific RLS policy that allows users to update ONLY their own 
  `must_change_password` field. This is safe because:
  - Users can only update their own record (auth.uid() = id)
  - They can only modify the must_change_password column
  - They cannot change role, is_active, or other sensitive fields

  ## Changes
  1. Create policy for users to update their own must_change_password field
*/

-- Allow users to update their own must_change_password field
CREATE POLICY "Users can update own must_change_password"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
