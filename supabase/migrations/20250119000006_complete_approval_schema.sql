-- Complete Account Approval Schema for RAN Shift Sync
-- Run this in Supabase SQL Editor to set up the complete approval system

-- 1. Create approval status enum if not exists
DO $$ BEGIN
    CREATE TYPE approval_status AS ENUM ('pending','approved','rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create app_admins table for admin management
CREATE TABLE IF NOT EXISTS public.app_admins (
    email TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add the admin email
INSERT INTO public.app_admins(email) VALUES ('lyhoanghaiceo@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- 3. Helper functions for RLS policies
CREATE OR REPLACE FUNCTION public.current_email()
RETURNS TEXT 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER
AS $$
    SELECT COALESCE(
        NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email',
        ''
    )
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.app_admins a
        WHERE a.email = public.current_email()
    )
$$;

-- 4. Update profiles table to use approval_status enum (if needed)
-- Note: The existing profiles table already has status field, this ensures compatibility
DO $$ BEGIN
    -- Add approval_status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'approval_status') THEN
        ALTER TABLE public.profiles ADD COLUMN approval_status approval_status DEFAULT 'pending';
        
        -- Sync existing status to approval_status
        UPDATE public.profiles SET approval_status = status::approval_status WHERE status IS NOT NULL;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- If enum conversion fails, keep existing status field
        NULL;
END $$;

-- 5. Enhanced RLS policies for profiles (compatible with existing structure)
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "profiles_select_self_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin_only" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin_only" ON public.profiles;

-- Create new comprehensive policies
CREATE POLICY "profiles_select_self_or_admin" ON public.profiles
FOR SELECT TO authenticated
USING (
    auth.uid() = user_id 
    OR public.is_admin()
);

CREATE POLICY "profiles_insert_self" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_admin_only" ON public.profiles
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "profiles_delete_admin_only" ON public.profiles
FOR DELETE TO authenticated
USING (public.is_admin());

-- 6. Enhanced approval check function
-- This function handles both old (id-based) and new (user_id-based) profiles table structure
CREATE OR REPLACE FUNCTION public.is_approved(p_uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN 
LANGUAGE plpgsql 
STABLE 
SECURITY DEFINER
AS $$
DECLARE
    has_user_id_column BOOLEAN;
    result BOOLEAN := FALSE;
BEGIN
    -- Check if profiles table has user_id column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) INTO has_user_id_column;
    
    -- Use appropriate column based on table structure
    IF has_user_id_column THEN
        -- New structure: profiles has user_id column
        SELECT EXISTS (
            SELECT 1 FROM public.profiles
            WHERE user_id = p_uid 
            AND (status = 'approved' OR approval_status = 'approved')
        ) INTO result;
    ELSE
        -- Old structure: profiles uses id as primary key
        SELECT EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = p_uid
            AND (approval_status = 'approved' OR status = 'approved')
        ) INTO result;
    END IF;
    
    RETURN result;
END;
$$;

-- 7. Update existing business tables with approval requirements
-- This ensures all existing tables require approved status

-- Update shift_reports policies (if table exists)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shift_reports') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "shift_reports_select_approved" ON public.shift_reports;
        DROP POLICY IF EXISTS "shift_reports_insert_approved" ON public.shift_reports;
        DROP POLICY IF EXISTS "shift_reports_update_approved" ON public.shift_reports;
        DROP POLICY IF EXISTS "shift_reports_delete_approved" ON public.shift_reports;
        
        -- Create approval-required policies
        CREATE POLICY "shift_reports_select_approved" ON public.shift_reports
        FOR SELECT TO authenticated
        USING (public.is_approved());
        
        CREATE POLICY "shift_reports_insert_approved" ON public.shift_reports
        FOR INSERT TO authenticated
        WITH CHECK (public.is_approved() AND auth.uid() = user_id);
        
        CREATE POLICY "shift_reports_update_approved" ON public.shift_reports
        FOR UPDATE TO authenticated
        USING (public.is_approved() AND auth.uid() = user_id)
        WITH CHECK (public.is_approved() AND auth.uid() = user_id);
        
        CREATE POLICY "shift_reports_delete_approved" ON public.shift_reports
        FOR DELETE TO authenticated
        USING (public.is_approved() AND auth.uid() = user_id);
    END IF;
END $$;

-- Update user_roles policies (if table exists)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "user_roles_select_approved" ON public.user_roles;
        DROP POLICY IF EXISTS "user_roles_admin_manage" ON public.user_roles;
        
        -- Create approval-required policies
        CREATE POLICY "user_roles_select_approved" ON public.user_roles
        FOR SELECT TO authenticated
        USING (public.is_approved() AND user_id = auth.uid());
        
        CREATE POLICY "user_roles_admin_manage" ON public.user_roles
        FOR ALL TO authenticated
        USING (public.is_admin())
        WITH CHECK (public.is_admin());
    END IF;
END $$;

-- 8. Create trigger to auto-approve admin email
CREATE OR REPLACE FUNCTION public.auto_approve_admin()
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
BEGIN
    -- Get user email from auth.users
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = NEW.user_id;
    
    -- Check if the user email is admin
    IF EXISTS (SELECT 1 FROM public.app_admins WHERE email = user_email) THEN
        NEW.status = 'approved';
        NEW.approval_status = 'approved';
        NEW.approved_at = NOW();
        NEW.role_name = 'admin';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto-approval
DROP TRIGGER IF EXISTS auto_approve_admin_trigger ON public.profiles;
CREATE TRIGGER auto_approve_admin_trigger
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_approve_admin();

-- 9. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON public.app_admins TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_email() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_approved(UUID) TO authenticated, anon;

-- 10. Success message
SELECT 'Complete approval schema setup completed successfully!' as message,
       'Admin email: lyhoanghaiceo@gmail.com will be auto-approved' as note;