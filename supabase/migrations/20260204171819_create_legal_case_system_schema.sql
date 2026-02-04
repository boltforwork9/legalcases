/*
  # Legal Case Search System Database Schema

  ## Overview
  This migration creates the complete database schema for a secure internal legal case search system
  for lawyers with role-based access control.

  ## Tables Created

  ### 1. profiles
  Extends auth.users with additional profile information and role-based access
  - `id` (uuid, FK to auth.users) - Primary key
  - `name` (text) - Full name of the user
  - `email` (text) - User email address
  - `role` (text) - User role: 'admin' or 'lawyer'
  - `is_active` (boolean) - Whether the account is active
  - `must_change_password` (boolean) - Forces password change on next login
  - `created_at` (timestamptz) - Account creation timestamp

  ### 2. people
  Stores information about individuals in the legal system
  - `id` (uuid) - Primary key
  - `full_name` (text) - Full name of the person
  - `national_id` (text, unique) - National ID number
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. cases
  Stores legal case information linked to people
  - `id` (uuid) - Primary key
  - `person_id` (uuid, FK to people.id) - Link to person
  - `case_type` (text) - Type of legal case
  - `court_name` (text) - Name of the court
  - `case_number` (text) - Unique case number
  - `status` (text) - Current status of the case
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. search_logs
  Audit trail for all search operations
  - `id` (uuid) - Primary key
  - `user_id` (uuid, FK to profiles.id) - User who performed the search
  - `person_id` (uuid, FK to people.id) - Person being searched
  - `searched_at` (timestamptz) - Timestamp of the search

  ## Security
  
  All tables have Row Level Security (RLS) enabled with the following policies:
  
  ### profiles
  - Authenticated users can read all profiles
  - Only admins can insert, update, or delete profiles
  
  ### people
  - Authenticated users can read people records
  - Only admins can insert, update, or delete people records
  
  ### cases
  - Authenticated users can read cases
  - Only admins can insert, update, or delete cases
  
  ### search_logs
  - Users can insert their own search logs
  - Users can read their own search logs
  - Admins can read all search logs

  ## Important Notes
  - No public signup is allowed; admins must create all user accounts
  - All write operations are restricted to admin users only
  - Every search operation must be logged for audit purposes
  - RLS policies ensure data isolation and security
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'lawyer')),
  is_active boolean DEFAULT true NOT NULL,
  must_change_password boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create people table
CREATE TABLE IF NOT EXISTS people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  national_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create cases table
CREATE TABLE IF NOT EXISTS cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  case_type text NOT NULL,
  court_name text NOT NULL,
  case_number text NOT NULL,
  status text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create search_logs table
CREATE TABLE IF NOT EXISTS search_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  searched_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_people_full_name ON people(full_name);
CREATE INDEX IF NOT EXISTS idx_people_national_id ON people(national_id);
CREATE INDEX IF NOT EXISTS idx_cases_person_id ON cases(person_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_user_id ON search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_person_id ON search_logs(person_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_searched_at ON search_logs(searched_at);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Authenticated users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Only admins can update profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Only admins can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

-- RLS Policies for people table
CREATE POLICY "Authenticated users can view people"
  ON people FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Only admins can insert people"
  ON people FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Only admins can update people"
  ON people FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Only admins can delete people"
  ON people FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

-- RLS Policies for cases table
CREATE POLICY "Authenticated users can view cases"
  ON cases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Only admins can insert cases"
  ON cases FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Only admins can update cases"
  ON cases FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Only admins can delete cases"
  ON cases FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

-- RLS Policies for search_logs table
CREATE POLICY "Users can insert their own search logs"
  ON search_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Users can view their own search logs"
  ON search_logs FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_active = true
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_people_updated_at
  BEFORE UPDATE ON people
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile automatically when a user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, is_active, must_change_password)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'lawyer'),
    true,
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();