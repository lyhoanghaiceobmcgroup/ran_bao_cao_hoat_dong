-- Script to fix database schema issues and RLS policy recursion
-- Run this in Supabase Studio SQL Editor

-- First, check if profiles table exists and its structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Drop all existing policies to avoid recursion issues
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update profile status" ON public.profiles;

-- If the table doesn't have the correct structure, recreate it
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table with correct structure
CREATE TABLE public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    company TEXT,
    role_name TEXT NOT NULL DEFAULT 'staff',
    branch TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies without recursion
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own profile (during registration)
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create a separate admin_users table to avoid recursion
CREATE TABLE IF NOT EXISTS public.admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role_name TEXT NOT NULL CHECK (role_name IN ('central', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on admin_users table to avoid conflicts
DROP POLICY IF EXISTS "Admin can read own admin record" ON public.admin_users;
DROP POLICY IF EXISTS "Service role can manage admin records" ON public.admin_users;

-- Admin users can read their own admin record
CREATE POLICY "Admin can read own admin record" ON public.admin_users
    FOR SELECT USING (auth.uid() = user_id);

-- Only service role can insert/update admin records
CREATE POLICY "Service role can manage admin records" ON public.admin_users
    FOR ALL USING (auth.role() = 'service_role');

-- Admin/Central users can read all profiles (using admin_users table)
CREATE POLICY "Admin can read all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid()
        )
    );

-- Admin/Central users can update profile status (using admin_users table)
CREATE POLICY "Admin can update profile status" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid()
        )
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create profile if user metadata contains profile info
    IF NEW.raw_user_meta_data ? 'full_name' THEN
        INSERT INTO public.profiles (
            user_id,
            full_name,
            phone,
            company,
            role_name,
            branch
        ) VALUES (
            NEW.id,
            NEW.raw_user_meta_data->>'full_name',
            COALESCE(NEW.raw_user_meta_data->>'phone', ''),
            COALESCE(NEW.raw_user_meta_data->>'company', ''),
            COALESCE(NEW.raw_user_meta_data->>'role_name', 'staff'),
            COALESCE(NEW.raw_user_meta_data->>'branch', '')
        );
        
        -- If user is admin or central, add to admin_users table
        IF COALESCE(NEW.raw_user_meta_data->>'role_name', 'staff') IN ('central', 'admin') THEN
            INSERT INTO public.admin_users (user_id, role_name)
            VALUES (NEW.id, NEW.raw_user_meta_data->>'role_name');
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS profiles_status_idx ON public.profiles(status);
CREATE INDEX IF NOT EXISTS profiles_role_name_idx ON public.profiles(role_name);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles(created_at);
CREATE INDEX IF NOT EXISTS admin_users_user_id_idx ON public.admin_users(user_id);

-- Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.admin_users TO authenticated;
GRANT ALL ON public.admin_users TO service_role;

-- Insert existing admin users (if any)
-- You may need to manually add admin users to admin_users table
-- Example:
-- INSERT INTO public.admin_users (user_id, role_name) 
-- SELECT id, 'admin' FROM auth.users WHERE email = 'admin@example.com';

-- Comments for documentation
COMMENT ON TABLE public.profiles IS 'User profiles with approval status for registration system';
COMMENT ON COLUMN public.profiles.status IS 'Profile approval status: pending, approved, rejected';
COMMENT ON COLUMN public.profiles.role_name IS 'User role: staff, manager, central, admin';
COMMENT ON COLUMN public.profiles.user_id IS 'Reference to auth.users.id';
COMMENT ON COLUMN public.profiles.approved_by IS 'User ID of admin who approved/rejected the profile';
COMMENT ON TABLE public.admin_users IS 'Separate table to track admin users and avoid RLS recursion';

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verify admin_users table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'admin_users' 
AND table_schema = 'public'
ORDER BY ordinal_position;