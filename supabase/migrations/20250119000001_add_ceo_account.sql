-- Migration to add CEO account
-- This migration adds the CEO account with central role and full access

-- Insert CEO user into auth.users table (if using Supabase Auth)
-- Note: In production, you should use Supabase Auth API to create users
-- This is for development/demo purposes

-- Insert CEO profile into profiles table
INSERT INTO profiles (
  id,
  email,
  name,
  role,
  branch,
  account_status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'lyhoanghaiceo@gmail.com',
  'Lý Hoàng Hải CEO',
  'central',
  '',
  'approved',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  branch = EXCLUDED.branch,
  account_status = EXCLUDED.account_status,
  updated_at = NOW();

-- Grant full permissions to CEO account
-- Add any additional permissions or roles as needed

-- Log the creation
DO $$
BEGIN
  RAISE NOTICE 'CEO account created: lyhoanghaiceo@gmail.com with central role';
END $$;