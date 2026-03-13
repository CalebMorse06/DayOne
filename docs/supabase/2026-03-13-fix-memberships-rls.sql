-- =============================================================================
-- Fix: Infinite recursion in RLS policies on memberships table
-- Date: 2026-03-13
--
-- Problem: RLS policies on `memberships` contain subqueries that reference
-- the `memberships` table itself, causing infinite policy evaluation.
-- This breaks course saves AND progress/XP saves.
--
-- Fix: Create a SECURITY DEFINER function that queries memberships bypassing
-- RLS, then replace all inline memberships subqueries with calls to it.
--
-- Run this in the Supabase SQL Editor.
-- =============================================================================

-- Step 1: Create helper function that bypasses RLS
CREATE OR REPLACE FUNCTION public.is_org_admin(check_org_id uuid, check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE org_id = check_org_id
      AND user_id = check_user_id
      AND role IN ('admin', 'owner')
  );
$$;

-- Step 2: Drop existing problematic policies and recreate them

-- ---- memberships ----
DROP POLICY IF EXISTS "admins can manage memberships in their org" ON public.memberships;
CREATE POLICY "admins can manage memberships in their org"
  ON public.memberships
  FOR ALL
  USING (
    public.is_org_admin(org_id, auth.uid())
  )
  WITH CHECK (
    public.is_org_admin(org_id, auth.uid())
  );

DROP POLICY IF EXISTS "users can view their own memberships" ON public.memberships;
CREATE POLICY "users can view their own memberships"
  ON public.memberships
  FOR SELECT
  USING (user_id = auth.uid());

-- ---- organizations ----
DROP POLICY IF EXISTS "admins can manage their org" ON public.organizations;
CREATE POLICY "admins can manage their org"
  ON public.organizations
  FOR ALL
  USING (
    public.is_org_admin(id, auth.uid())
  )
  WITH CHECK (
    public.is_org_admin(id, auth.uid())
  );

-- ---- courses ----
DROP POLICY IF EXISTS "admins can manage courses in their org" ON public.courses;
CREATE POLICY "admins can manage courses in their org"
  ON public.courses
  FOR ALL
  USING (
    public.is_org_admin(org_id, auth.uid())
  )
  WITH CHECK (
    public.is_org_admin(org_id, auth.uid())
  );

DROP POLICY IF EXISTS "org members can view courses" ON public.courses;
CREATE POLICY "org members can view courses"
  ON public.courses
  FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

-- ---- progress (no org_id column — join through courses) ----
DROP POLICY IF EXISTS "users can manage their own progress" ON public.progress;
CREATE POLICY "users can manage their own progress"
  ON public.progress
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "admins can view progress in their org" ON public.progress;
CREATE POLICY "admins can view progress in their org"
  ON public.progress
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id
        AND public.is_org_admin(c.org_id, auth.uid())
    )
  );

-- ---- invites ----
DROP POLICY IF EXISTS "admins can manage invites in their org" ON public.invites;
CREATE POLICY "admins can manage invites in their org"
  ON public.invites
  FOR ALL
  USING (
    public.is_org_admin(org_id, auth.uid())
  )
  WITH CHECK (
    public.is_org_admin(org_id, auth.uid())
  );

-- ---- assignments ----
DROP POLICY IF EXISTS "admins can manage assignments in their org" ON public.assignments;
CREATE POLICY "admins can manage assignments in their org"
  ON public.assignments
  FOR ALL
  USING (
    public.is_org_admin(org_id, auth.uid())
  )
  WITH CHECK (
    public.is_org_admin(org_id, auth.uid())
  );

DROP POLICY IF EXISTS "users can view their own assignments" ON public.assignments;
CREATE POLICY "users can view their own assignments"
  ON public.assignments
  FOR SELECT
  USING (user_id = auth.uid());
