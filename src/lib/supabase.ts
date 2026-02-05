import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'lawyer';
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
}

export interface Person {
  id: string;
  full_name: string;
  national_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Case {
  id: string;
  person_id: string;
  case_type: string;
  court_name: string;
  case_number: string;
  session_date: string | null;
  decision: string;
  created_at: string;
  updated_at: string;
}

export interface SearchLog {
  id: string;
  user_id: string;
  person_id: string;
  searched_at: string;
}

export interface PersonWithCaseCount extends Person {
  case_count: number;
}

export interface PersonWithCases extends Person {
  cases: Case[];
}
