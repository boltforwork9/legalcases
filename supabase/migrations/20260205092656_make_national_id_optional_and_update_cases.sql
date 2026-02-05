/*
  # Make National ID Optional and Update Case Structure

  1. Changes to `people` table
    - Make `national_id` nullable (optional)
    
  2. Changes to `cases` table
    - Remove `status` column
    - Add `session_date` column (date)
    - Add `decision` column (text)

  3. Security
    - No changes to RLS policies
    - All existing policies remain in effect
*/

-- Make national_id optional in people table
ALTER TABLE people 
ALTER COLUMN national_id DROP NOT NULL;

-- Update cases table structure
-- Remove status column
ALTER TABLE cases 
DROP COLUMN IF EXISTS status;

-- Add new columns
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS session_date date;

ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS decision text DEFAULT '';
