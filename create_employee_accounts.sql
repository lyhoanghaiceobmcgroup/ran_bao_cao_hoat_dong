-- Script to create 7 employee accounts with access to HN35 and HN40 branches
-- Run this in Supabase Studio SQL Editor

-- Create employee accounts with authentication and profile data

-- 1. Lành An Khang
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'khangthitbo123@gmail.com',
    crypt('0865154423', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Lành An Khang", "role_name": "staff", "company": "RAN Group", "branch": "HN35,HN40"}',
    false,
    'authenticated'
);

-- 2. LÊ QUỐC BẢO
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'lequocbao240107@gmail.com',
    crypt('0832041111', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "LÊ QUỐC BẢO", "role_name": "staff", "company": "RAN Group", "branch": "HN35,HN40"}',
    false,
    'authenticated'
);

-- 3. Nguyễn lan phương
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'lanphuongbe110207@gmail.com',
    crypt('0385658335', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Nguyễn lan phương", "role_name": "staff", "company": "RAN Group", "branch": "HN35,HN40"}',
    false,
    'authenticated'
);

-- 4. ĐỨC ANH
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'tducanh2002lc@gmail.com',
    crypt('0828888598', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "ĐỨC ANH", "role_name": "staff", "company": "RAN Group", "branch": "HN35,HN40"}',
    false,
    'authenticated'
);

-- 5. Võ Lê phương
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'volephuong3502@gmail.com',
    crypt('0945373568', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Võ Lê phương", "role_name": "staff", "company": "RAN Group", "branch": "HN35,HN40"}',
    false,
    'authenticated'
);

-- 6. Vũ thanh tùng
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Thanhtung.themask@gmail.com',
    crypt('0942246586', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Vũ thanh tùng", "role_name": "staff", "company": "RAN Group", "branch": "HN35,HN40"}',
    false,
    'authenticated'
);

-- 7. Mai khương duy
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Mkd1272019@gmail.com',
    crypt('0335103153', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Mai khương duy", "role_name": "staff", "company": "RAN Group", "branch": "HN35,HN40"}',
    false,
    'authenticated'
);

-- Create profiles for all employees and approve them
DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Loop through all newly created users
    FOR user_record IN 
        SELECT id, email, raw_user_meta_data
        FROM auth.users 
        WHERE email IN (
            'khangthitbo123@gmail.com',
            'lequocbao240107@gmail.com', 
            'lanphuongbe110207@gmail.com',
            'tducanh2002lc@gmail.com',
            'volephuong3502@gmail.com',
            'Thanhtung.themask@gmail.com',
            'Mkd1272019@gmail.com'
        )
    LOOP
        -- Insert profile for each user
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
            user_record.id,
            user_record.raw_user_meta_data->>'full_name',
            '',
            'RAN Group',
            'staff',
            'HN35,HN40',
            'approved',
            NOW()
        ) ON CONFLICT (user_id) DO UPDATE SET
            role_name = 'staff',
            branch = 'HN35,HN40',
            status = 'approved',
            approved_at = NOW();
            
        RAISE NOTICE 'Created profile for: %', user_record.raw_user_meta_data->>'full_name';
    END LOOP;
END $$;

-- Verify all accounts were created successfully
SELECT 
    u.email,
    p.full_name,
    p.role_name,
    p.branch,
    p.status,
    p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE u.email IN (
    'khangthitbo123@gmail.com',
    'lequocbao240107@gmail.com', 
    'lanphuongbe110207@gmail.com',
    'tducanh2002lc@gmail.com',
    'volephuong3502@gmail.com',
    'Thanhtung.themask@gmail.com',
    'Mkd1272019@gmail.com'
)
ORDER BY p.created_at;

-- Instructions:
-- 1. Copy this entire script
-- 2. Go to Supabase Studio > SQL Editor
-- 3. Paste and run the script
-- 4. All 7 employee accounts will be created with:
--    - Authentication credentials (email/password)
--    - Profile with staff role
--    - Access to both HN35 and HN40 branches
--    - Approved status (ready to use)
-- 5. Employees can now login and access both branch dashboards