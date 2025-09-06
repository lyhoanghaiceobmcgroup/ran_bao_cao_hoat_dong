-- Script to create CEO account after deployment
-- Run this in your Supabase SQL Editor after first deployment

-- Insert CEO user into auth.users (this should be done through Supabase Auth UI first)
-- Then run this script to set up the profile

-- Create CEO profile
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  branch,
  approval_status,
  created_at,
  updated_at
) VALUES (
  -- Replace 'USER_ID_FROM_AUTH' with the actual user ID from auth.users
  'USER_ID_FROM_AUTH',
  'ceo@ranshiftsync.com',
  'CEO Admin',
  'center',
  'approved',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  role = 'center',
  approval_status = 'approved',
  updated_at = NOW();

-- Verify the CEO account was created
SELECT 
  id,
  email,
  full_name,
  role,
  branch,
  approval_status,
  created_at
FROM public.profiles 
WHERE role = 'center' AND approval_status = 'approved';

-- Instructions:
-- 1. First, create a user account through your app's signup form
-- 2. Copy the user ID from auth.users table
-- 3. Replace 'USER_ID_FROM_AUTH' with the actual user ID
-- 4. Run this script in Supabase SQL Editor
-- 5. The CEO account will now have access to the Center Dashboard