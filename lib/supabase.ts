import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Guard: createClient throws if URL is empty. Export null when env vars are missing.
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

/**
 * DATABASE SCHEMA (for Supabase SQL Editor):
 *
 * -- Create courses table
 * CREATE TABLE courses (
 *   id TEXT PRIMARY KEY,
 *   user_id UUID REFERENCES auth.users(id),
 *   title TEXT NOT NULL,
 *   data JSONB NOT NULL,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
 * );
 *
 * -- Create progress table
 * CREATE TABLE progress (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id UUID REFERENCES auth.users(id),
 *   course_id TEXT REFERENCES courses(id),
 *   data JSONB NOT NULL,
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
 *   UNIQUE(user_id, course_id)
 * );
 *
 * -- Enable RLS
 * ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
 *
 * -- Policies
 * CREATE POLICY "Users can manage their own courses" ON courses FOR ALL USING (auth.uid() = user_id);
 * CREATE POLICY "Users can manage their own progress" ON progress FOR ALL USING (auth.uid() = user_id);
 */
