-- Database setup script for RAN Shift Sync System
-- Run this script in your Supabase SQL Editor to set up the database

-- Enable Row Level Security
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.shift_reports ENABLE ROW LEVEL SECURITY;

-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('employee', 'manager', 'center')) NOT NULL DEFAULT 'employee',
  branch TEXT CHECK (branch IN ('hn35', 'hn40')),
  approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shift_reports table if not exists
CREATE TABLE IF NOT EXISTS public.shift_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  branch TEXT CHECK (branch IN ('hn35', 'hn40')) NOT NULL,
  shift_date DATE NOT NULL,
  shift_type TEXT CHECK (shift_type IN ('morning', 'afternoon', 'evening')) NOT NULL,
  status TEXT CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')) NOT NULL DEFAULT 'draft',
  report_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_branch ON public.profiles(branch);
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON public.profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_shift_reports_user_id ON public.shift_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_shift_reports_branch ON public.shift_reports(branch);
CREATE INDEX IF NOT EXISTS idx_shift_reports_shift_date ON public.shift_reports(shift_date);
CREATE INDEX IF NOT EXISTS idx_shift_reports_status ON public.shift_reports(status);

-- Row Level Security Policies

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Center role can view all profiles" ON public.profiles;
CREATE POLICY "Center role can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'center' AND approval_status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Center role can update all profiles" ON public.profiles;
CREATE POLICY "Center role can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'center' AND approval_status = 'approved'
    )
  );

-- Shift reports policies
DROP POLICY IF EXISTS "Users can view own shift reports" ON public.shift_reports;
CREATE POLICY "Users can view own shift reports" ON public.shift_reports
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own shift reports" ON public.shift_reports;
CREATE POLICY "Users can create own shift reports" ON public.shift_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own shift reports" ON public.shift_reports;
CREATE POLICY "Users can update own shift reports" ON public.shift_reports
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Managers can view branch shift reports" ON public.shift_reports;
CREATE POLICY "Managers can view branch shift reports" ON public.shift_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
        AND role IN ('manager', 'center') 
        AND approval_status = 'approved'
        AND (role = 'center' OR branch = shift_reports.branch)
    )
  );

DROP POLICY IF EXISTS "Center role can view all shift reports" ON public.shift_reports;
CREATE POLICY "Center role can view all shift reports" ON public.shift_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'center' AND approval_status = 'approved'
    )
  );

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at timestamp
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_shift_reports_updated_at ON public.shift_reports;
CREATE TRIGGER update_shift_reports_updated_at
  BEFORE UPDATE ON public.shift_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.shift_reports TO anon, authenticated;

-- Success message
SELECT 'Database setup completed successfully!' as message;