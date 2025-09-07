-- Script to create admin account
-- Run this in Supabase Studio SQL Editor after running fix_database_schema.sql

-- Create admin account with email: lyhoanghaiceo@gmai.com
-- Password: Hai.1809
-- This account will have full admin access to all pages and permissions

-- Insert into auth.users (this creates the authentication record)
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
    'lyhoanghaiceo@gmai.com',
    crypt('Hai.1809', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "CEO Lý Hoàng Hải", "role_name": "admin", "company": "RAN Group", "branch": "Trung tâm"}',
    false,
    'authenticated'
);

-- Get the user ID for the admin account
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the user ID
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'lyhoanghaiceo@gmai.com';
    
    -- Insert into profiles table
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
        admin_user_id,
        'CEO Lý Hoàng Hải',
        '',
        'RAN Group',
        'admin',
        'Trung tâm',
        'approved',
        NOW()
    ) ON CONFLICT (user_id) DO UPDATE SET
        role_name = 'admin',
        status = 'approved',
        approved_at = NOW();
    
    -- Insert into admin_users table
    INSERT INTO public.admin_users (
        user_id,
        role_name
    ) VALUES (
        admin_user_id,
        'admin'
    ) ON CONFLICT (user_id) DO UPDATE SET
        role_name = 'admin';
        
    RAISE NOTICE 'Admin account created successfully with ID: %', admin_user_id;
END $$;

-- Verify the admin account was created
SELECT 
    u.id,
    u.email,
    p.full_name,
    p.role_name,
    p.status,
    au.role_name as admin_role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
LEFT JOIN public.admin_users au ON u.id = au.user_id
WHERE u.email = 'lyhoanghaiceo@gmai.com';