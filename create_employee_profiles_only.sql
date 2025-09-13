-- Script to create employee profiles after auth users are created manually
-- This script assumes auth users have been created through Supabase Auth UI
-- Run this in Supabase Studio SQL Editor

-- Employee data to be created
-- 1. Lành An Khang - khangthitbo123@gmail.com
-- 2. LÊ QUỐC BẢO - lequocbao240107@gmail.com  
-- 3. Nguyễn lan phương - lanphuongbe110207@gmail.com
-- 4. ĐỨC ANH - tducanh2002lc@gmail.com
-- 5. Võ Lê phương - volephuong3502@gmail.com
-- 6. Vũ thanh tùng - Thanhtung.themask@gmail.com
-- 7. Mai khương duy - Mkd1272019@gmail.com

-- Create profiles for employees (assuming auth users exist)
DO $$
DECLARE
    user_record RECORD;
    employee_data JSONB;
BEGIN
    -- Define employee data
    employee_data := '[
        {"email": "khangthitbo123@gmail.com", "full_name": "Lành An Khang"},
        {"email": "lequocbao240107@gmail.com", "full_name": "LÊ QUỐC BẢO"},
        {"email": "lanphuongbe110207@gmail.com", "full_name": "Nguyễn lan phương"},
        {"email": "tducanh2002lc@gmail.com", "full_name": "ĐỨC ANH"},
        {"email": "volephuong3502@gmail.com", "full_name": "Võ Lê phương"},
        {"email": "Thanhtung.themask@gmail.com", "full_name": "Vũ thanh tùng"},
        {"email": "Mkd1272019@gmail.com", "full_name": "Mai khương duy"}
    ]'::JSONB;
    
    -- Loop through employee data
    FOR user_record IN 
        SELECT 
            u.id as user_id,
            u.email,
            (employee_data -> (array_position(ARRAY[
                'khangthitbo123@gmail.com',
                'lequocbao240107@gmail.com', 
                'lanphuongbe110207@gmail.com',
                'tducanh2002lc@gmail.com',
                'volephuong3502@gmail.com',
                'Thanhtung.themask@gmail.com',
                'Mkd1272019@gmail.com'
            ], u.email) - 1) ->> 'full_name') as full_name
        FROM auth.users u
        WHERE u.email = ANY(ARRAY[
            'khangthitbo123@gmail.com',
            'lequocbao240107@gmail.com', 
            'lanphuongbe110207@gmail.com',
            'tducanh2002lc@gmail.com',
            'volephuong3502@gmail.com',
            'Thanhtung.themask@gmail.com',
            'Mkd1272019@gmail.com'
        ])
    LOOP
        -- Insert or update profile for each user
        INSERT INTO public.profiles (
            user_id,
            full_name,
            phone,
            company,
            role_name,
            branch,
            status,
            approved_at
        ) VALUES (
            user_record.user_id,
            user_record.full_name,
            '',
            'RAN Group',
            'staff',
            'HN35,HN40',
            'approved',
            NOW()
        ) ON CONFLICT (user_id) DO UPDATE SET
            full_name = user_record.full_name,
            role_name = 'staff',
            branch = 'HN35,HN40',
            status = 'approved',
            approved_at = NOW(),
            updated_at = NOW();
            
        RAISE NOTICE 'Created/Updated profile for: % (%)', user_record.full_name, user_record.email;
    END LOOP;
    
    -- Show summary
    RAISE NOTICE 'Profile creation completed!';
END $$;

-- Verify profiles were created
SELECT 
    u.email,
    p.full_name,
    p.role_name,
    p.branch,
    p.status,
    p.created_at,
    p.approved_at
FROM auth.users u
INNER JOIN public.profiles p ON u.id = p.user_id
WHERE u.email = ANY(ARRAY[
    'khangthitbo123@gmail.com',
    'lequocbao240107@gmail.com', 
    'lanphuongbe110207@gmail.com',
    'tducanh2002lc@gmail.com',
    'volephuong3502@gmail.com',
    'Thanhtung.themask@gmail.com',
    'Mkd1272019@gmail.com'
])
ORDER BY p.created_at;

-- Instructions:
-- STEP 1: Create auth users manually in Supabase Studio
--   1. Go to Authentication > Users
--   2. Click "Add user" for each employee:
--      - Email: khangthitbo123@gmail.com, Password: 0865154423
--      - Email: lequocbao240107@gmail.com, Password: 0832041111
--      - Email: lanphuongbe110207@gmail.com, Password: 0385658335
--      - Email: tducanh2002lc@gmail.com, Password: 0828888598
--      - Email: volephuong3502@gmail.com, Password: 0945373568
--      - Email: Thanhtung.themask@gmail.com, Password: 0942246586
--      - Email: Mkd1272019@gmail.com, Password: 0335103153
--   3. Set "Email Confirm" to true for each user
--
-- STEP 2: Run this SQL script
--   1. Copy this entire script
--   2. Go to SQL Editor in Supabase Studio
--   3. Paste and run the script
--   4. Check the results to confirm profiles were created
--
-- STEP 3: Test login
--   1. Go to your application
--   2. Try logging in with any of the created accounts
--   3. Verify access to HN35 and HN40 dashboards