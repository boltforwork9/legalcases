/*
  # Add case_year field to cases table

  1. Changes
    - Add `case_year` column to `cases` table (integer, nullable)
    - Column stores the year of the case (e.g., 2024)
  
  2. Notes
    - Field is optional (nullable) for backward compatibility
    - No changes to existing data
    - No changes to RLS policies
*/

-- Add case_year column to cases table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cases' AND column_name = 'case_year'
  ) THEN
    ALTER TABLE cases ADD COLUMN case_year INTEGER;
  END IF;
END $$;
