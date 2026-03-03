import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Guard: createClient throws if URL is empty. Export null when env vars are missing.
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export type OrgRole = 'owner' | 'admin' | 'member'

export interface Organization {
  id: string
  name: string
  slug: string
  plan: 'free' | 'pro' | 'enterprise'
}

export interface Membership {
  id: string
  org_id: string
  user_id: string
  role: OrgRole
}

/**
 * DATABASE SCHEMA (Multi-tenant Enterprise Upgrade):
 * 
 * -- Create organizations table (Companies)
 * CREATE TABLE organizations (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   name TEXT NOT NULL,
 *   slug TEXT UNIQUE NOT NULL,
 *   stripe_customer_id TEXT,
 *   plan TEXT DEFAULT 'free', -- 'free', 'pro', 'enterprise'
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
 * );
 * 
 * -- Create memberships table (Link users to companies with roles)
 * CREATE TABLE memberships (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
 *   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member'
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
 *   UNIQUE(org_id, user_id)
 * );
 * 
 * -- Create courses table (Org-scoped)
 * CREATE TABLE courses (
 *   id TEXT PRIMARY KEY,
 *   user_id UUID REFERENCES auth.users(id),
 *   org_id UUID REFERENCES organizations(id),
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
 * ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
 * 
 * -- RLS Policies
 * CREATE POLICY "Users can see orgs they belong to" 
 * ON organizations FOR SELECT 
 * USING (id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid()));
 * 
 * CREATE POLICY "Members can see their own memberships" 
 * ON memberships FOR SELECT 
 * USING (user_id = auth.uid());
 * 
 * CREATE POLICY "Users can manage their own courses" ON courses FOR ALL USING (auth.uid() = user_id);
 * CREATE POLICY "Users can manage their own progress" ON progress FOR ALL USING (auth.uid() = user_id);
 */
