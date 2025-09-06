-- Script to create HN35 Employee account
-- Run this in your Supabase SQL Editor to create the employee account

-- First, you need to create the user through Supabase Auth
-- This can be done via the Supabase Dashboard > Authentication > Users
-- Or through the signup form in your application

-- After creating the auth user, get the user ID and replace 'USER_ID_FROM_AUTH' below
-- Then run this script to set up the employee profile

-- Create HN35 Employee profile
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
  'ranhn35@ran.com',
  'Nhân viên HN35',
  'employee',
  'hn35',
  'approved',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = 'ranhn35@ran.com',
  full_name = 'Nhân viên HN35',
  role = 'employee',
  branch = 'hn35',
  approval_status = 'approved',
  updated_at = NOW();

-- Verify the employee account was created
SELECT 
  id,
  email,
  full_name,
  role,
  branch,
  approval_status,
  created_at
FROM public.profiles 
WHERE email = 'ranhn35@ran.com';

-- Instructions:
-- 1. Create user account through Supabase Dashboard:
--    - Go to Authentication > Users
--    - Click "Add user"
--    - Email: ranhn35@ran.com
--    - Password: 123123
--    - Email Confirm: true
-- 2. Copy the user ID from the created user
-- 3. Replace 'USER_ID_FROM_AUTH' with the actual user ID in this script
-- 4. Run this script in Supabase SQL Editor
-- 5. The employee can now login and access HN35 Dashboard

-- Alternative: Create through application signup form
-- 1. Go to your application signup page
-- 2. Fill in the form:
--    - Email: ranhn35@ran.com
--    - Password: 123123
--    - Full Name: Nhân viên HN35
--    - Role: Nhân viên
--    - Branch: 35 Nguyễn Bỉnh Khiêm
-- 3. After signup, run the approval part of this script to approve the account