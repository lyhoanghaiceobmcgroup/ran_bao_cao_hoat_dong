-- Script to verify employee accounts are working
-- Run this in Supabase Studio to check account status

-- Check if all 7 accounts exist and are properly configured
SELECT 
    'Account Status Check' as check_type,
    COUNT(*) as total_accounts,
    COUNT(CASE WHEN p.status = 'approved' THEN 1 END) as approved_accounts,
    COUNT(CASE WHEN p.role_name = 'staff' THEN 1 END) as staff_accounts
FROM auth.users u
INNER JOIN public.profiles p ON u.id = p.user_id
WHERE u.email IN (
    'khangthitbo123@gmail.com',
    'lequocbao240107@gmail.com', 
    'lanphuongbe110207@gmail.com',
    'tducanh2002lc@gmail.com',
    'volephuong3502@gmail.com',
    'Thanhtung.themask@gmail.com',
    'Mkd1272019@gmail.com'
);

-- Detailed account information
SELECT 
    u.email as login_email,
    p.full_name,
    p.phone as password_hint,
    p.role_name,
    p.branch,
    p.status,
    p.approved_at,
    u.email_confirmed_at,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL AND p.status = 'approved' 
        THEN '✅ Ready to login'
        ELSE '❌ Not ready'
    END as login_status
FROM auth.users u
INNER JOIN public.profiles p ON u.id = p.user_id
WHERE u.email IN (
    'khangthitbo123@gmail.com',
    'lequocbao240107@gmail.com', 
    'lanphuongbe110207@gmail.com',
    'tducanh2002lc@gmail.com',
    'volephuong3502@gmail.com',
    'Thanhtung.themask@gmail.com',
    'Mkd1272019@gmail.com'
)
ORDER BY p.full_name;

-- Check if auto_approve_admin function is working
SELECT 
    'Function Check' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'auto_approve_admin')
        THEN '✅ Function exists'
        ELSE '❌ Function missing'
    END as function_status;

-- Check trigger status
SELECT 
    'Trigger Check' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'auto_approve_admin_trigger')
        THEN '✅ Trigger exists'
        ELSE '❌ Trigger missing'
    END as trigger_status;

-- Login credentials summary
SELECT 
    '📋 LOGIN CREDENTIALS' as info_type,
    'Use these email/password combinations to test login:' as instructions;

SELECT 
    ROW_NUMBER() OVER (ORDER BY p.full_name) as account_number,
    u.email as email,
    p.phone as password,
    p.full_name as employee_name,
    p.branch as assigned_branches
FROM auth.users u
INNER JOIN public.profiles p ON u.id = p.user_id
WHERE u.email IN (
    'khangthitbo123@gmail.com',
    'lequocbao240107@gmail.com', 
    'lanphuongbe110207@gmail.com',
    'tducanh2002lc@gmail.com',
    'volephuong3502@gmail.com',
    'Thanhtung.themask@gmail.com',
    'Mkd1272019@gmail.com'
)
ORDER BY p.full_name;}}}