
-- Create a security definer function to check if a user is an admin
-- This prevents infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = is_admin.user_id 
    AND is_active = true
  );
$$;

-- Create a function to check if any admin users exist
CREATE OR REPLACE FUNCTION public.has_admin_users()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE is_active = true);
$$;

-- Drop the existing problematic RLS policy
DROP POLICY IF EXISTS "Admin access only" ON public.restaurants;

-- Create new RLS policies for restaurants table using the security definer function
CREATE POLICY "Admins can manage restaurants" ON public.restaurants
  FOR ALL 
  TO authenticated
  USING (public.is_admin());

-- Create bootstrap policy for restaurants (allows first admin creation)
CREATE POLICY "Bootstrap access when no admins exist" ON public.restaurants
  FOR ALL
  TO authenticated
  USING (NOT public.has_admin_users());

-- Update admin_users policies to allow bootstrap creation
DROP POLICY IF EXISTS "Admin users can view themselves" ON public.admin_users;

CREATE POLICY "Admin users can view themselves" ON public.admin_users
  FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage admin users" ON public.admin_users
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Allow bootstrap creation of first admin user
CREATE POLICY "Bootstrap first admin user" ON public.admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (NOT public.has_admin_users());

-- Update activity_logs policy
DROP POLICY IF EXISTS "Admin access to logs" ON public.activity_logs;

CREATE POLICY "Admin access to logs" ON public.activity_logs
  FOR SELECT 
  TO authenticated
  USING (public.is_admin());
