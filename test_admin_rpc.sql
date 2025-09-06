-- Test script for admin-only SECURITY DEFINER RPC functions
-- Run this script in your Supabase SQL editor or psql
-- Note: This assumes app_role enum and user_roles table already exist

-- Check if required tables and types exist
SELECT 'Checking database schema...' as status;

-- Check if app_role enum exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') 
    THEN 'app_role enum exists ✓' 
    ELSE 'app_role enum missing ✗' 
  END as app_role_status;

-- Check if user_roles table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles' AND table_schema = 'public') 
    THEN 'user_roles table exists ✓' 
    ELSE 'user_roles table missing ✗' 
  END as user_roles_status;

-- Then test them with these queries:

-- 1. Test admin_get_all_users() function
-- This should return all users if called by admin, or empty if called by non-admin
SELECT * FROM public.admin_get_all_users();

-- 2. Test admin_get_system_stats() function
-- This should return system statistics if called by admin
SELECT public.admin_get_system_stats();

-- 3. Test admin_update_account_status() function
-- Replace 'USER_ID_HERE' with actual user ID to test
-- SELECT public.admin_update_account_status('USER_ID_HERE', 'approved', NULL);

-- 4. Test access control - these should fail if not admin
-- Try calling functions without admin role to verify security

-- Example of how to grant admin role to a user for testing:
-- UPDATE public.user_roles 
-- SET role = 'admin', account_status = 'approved' 
-- WHERE user_id = 'YOUR_USER_ID_HERE';

-- Example of how to test with non-admin user:
-- UPDATE public.user_roles 
-- SET role = 'staff' 
-- WHERE user_id = 'YOUR_USER_ID_HERE';
-- Then try calling the functions - they should return empty or raise exceptions

/*
Key Security Features of these RPC functions:

1. SECURITY DEFINER: Functions run with the privileges of the function owner (postgres)
2. SET search_path = 'public': Prevents search path attacks
3. Role checking: Each function verifies the caller has admin role
4. Account status checking: Ensures admin account is approved
5. Input validation: Validates parameters before processing
6. Self-protection: Prevents admin from deleting their own account

Usage Examples:

-- Get all users (admin only)
SELECT * FROM public.admin_get_all_users();

-- Approve a user account (admin only)
SELECT public.admin_update_account_status('user-uuid-here', 'approved', NULL);

-- Reject a user account with reason (admin only)
SELECT public.admin_update_account_status('user-uuid-here', 'rejected', 'Invalid credentials');

-- Get system statistics (admin only)
SELECT public.admin_get_system_stats();

-- Delete a user account (admin only, cannot delete self)
SELECT public.admin_delete_user('user-uuid-here');
*/