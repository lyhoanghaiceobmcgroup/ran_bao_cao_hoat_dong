-- Complete script to create working employee accounts (with duplicate check)
-- This script fixes the trigger function and creates 7 employee accounts that can login immediately
-- Run this entire script in Supabase Studio SQL Editor

-- STEP 1: Fix the auto_approve_admin function first
DROP TRIGGER IF EXISTS auto_approve_admin_trigger ON public.profiles;

CREATE OR REPLACE FUNCTION public.auto_approve_admin()
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
    target_user_id UUID;
BEGIN
    -- Safely get user_id
    IF TG_TABLE_NAME = 'profiles' THEN
        IF NEW.user_id IS NOT NULL THEN
            target_user_id := NEW.user_id;
        ELSIF NEW.id IS NOT NULL THEN
            target_user_id := NEW.id;
        ELSE
            RETURN NEW; -- Skip if no valid ID
        END IF;
    ELSE
        target_user_id := NEW.id;
    END IF;
    
    -- Get user email
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = target_user_id;
    
    -- Auto-approve admin if app_admins table exists
    IF user_email IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'app_admins' AND table_schema = 'public') THEN
        IF EXISTS (SELECT 1 FROM public.app_admins WHERE email = user_email) THEN
            NEW.status = 'approved';
            NEW.role_name = 'admin';
            NEW.approved_at = NOW();
            NEW.approved_by = target_user_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER auto_approve_admin_trigger
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_approve_admin();

-- STEP 2: Create the 7 employee accounts with authentication (with duplicate check)

-- 1. Lành An Khang
DO $$
DECLARE
    new_user_id UUID;
    existing_user_id UUID;
BEGIN
    -- Check if user already exists
    SELECT id INTO existing_user_id FROM auth.users WHERE email = 'khangthitbo123@gmail.com';
    
    IF existing_user_id IS NULL THEN
        -- Insert into auth.users
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
            '{"full_name": "Lành An Khang"}',
            false,
            'authenticated'
        ) RETURNING id INTO new_user_id;
        
        -- Insert profile (check if not exists)
        INSERT INTO public.profiles (
            user_id,
            full_name,
            phone,
            company,
            role_name,
            branch,
            status,
            approved_at
        )
        SELECT 
            new_user_id,
            'Lành An Khang',
            '0865154423',
            'RAN Group',
            'staff',
            'HN35,HN40',
            'approved',
            NOW()
        WHERE NOT EXISTS (
            SELECT 1 FROM public.profiles WHERE user_id = new_user_id
        );
        
        RAISE NOTICE 'Created account for Lành An Khang: %', new_user_id;
    ELSE
        -- Update existing profile if needed
        UPDATE public.profiles SET
            full_name = 'Lành An Khang',
            phone = '0865154423',
            company = 'RAN Group',
            role_name = 'staff',
            branch = 'HN35,HN40',
            status = 'approved',
            approved_at = COALESCE(approved_at, NOW())
        WHERE user_id = existing_user_id;
        
        RAISE NOTICE 'Updated existing account for Lành An Khang: %', existing_user_id;
    END IF;
END $$;

-- 2. LÊ QUỐC BẢO
DO $$
DECLARE
    new_user_id UUID;
    existing_user_id UUID;
BEGIN
    SELECT id INTO existing_user_id FROM auth.users WHERE email = 'lequocbao240107@gmail.com';
    
    IF existing_user_id IS NULL THEN
        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
            is_super_admin, role
        ) VALUES (
            gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
            'lequocbao240107@gmail.com', crypt('0832041111', gen_salt('bf')), NOW(),
            NOW(), NOW(), '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "LÊ QUỐC BẢO"}', false, 'authenticated'
        ) RETURNING id INTO new_user_id;
        
        INSERT INTO public.profiles (
            user_id, full_name, phone, company, role_name, branch, status, approved_at
        )
        SELECT 
            new_user_id, 'LÊ QUỐC BẢO', '0832041111', 'RAN Group', 'staff', 'HN35,HN40', 'approved', NOW()
        WHERE NOT EXISTS (
            SELECT 1 FROM public.profiles WHERE user_id = new_user_id
        );
        
        RAISE NOTICE 'Created account for LÊ QUỐC BẢO: %', new_user_id;
    ELSE
        UPDATE public.profiles SET
            full_name = 'LÊ QUỐC BẢO', phone = '0832041111', company = 'RAN Group',
            role_name = 'staff', branch = 'HN35,HN40', status = 'approved',
            approved_at = COALESCE(approved_at, NOW())
        WHERE user_id = existing_user_id;
        
        RAISE NOTICE 'Updated existing account for LÊ QUỐC BẢO: %', existing_user_id;
    END IF;
END $$;

-- 3. Nguyễn lan phương
DO $$
DECLARE
    new_user_id UUID;
    existing_user_id UUID;
BEGIN
    SELECT id INTO existing_user_id FROM auth.users WHERE email = 'lanphuongbe110207@gmail.com';
    
    IF existing_user_id IS NULL THEN
        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
            is_super_admin, role
        ) VALUES (
            gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
            'lanphuongbe110207@gmail.com', crypt('0385658335', gen_salt('bf')), NOW(),
            NOW(), NOW(), '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Nguyễn lan phương"}', false, 'authenticated'
        ) RETURNING id INTO new_user_id;
        
        INSERT INTO public.profiles (
            user_id, full_name, phone, company, role_name, branch, status, approved_at
        )
        SELECT 
            new_user_id, 'Nguyễn lan phương', '0385658335', 'RAN Group', 'staff', 'HN35,HN40', 'approved', NOW()
        WHERE NOT EXISTS (
            SELECT 1 FROM public.profiles WHERE user_id = new_user_id
        );
        
        RAISE NOTICE 'Created account for Nguyễn lan phương: %', new_user_id;
    ELSE
        UPDATE public.profiles SET
            full_name = 'Nguyễn lan phương', phone = '0385658335', company = 'RAN Group',
            role_name = 'staff', branch = 'HN35,HN40', status = 'approved',
            approved_at = COALESCE(approved_at, NOW())
        WHERE user_id = existing_user_id;
        
        RAISE NOTICE 'Updated existing account for Nguyễn lan phương: %', existing_user_id;
    END IF;
END $$;

-- 4. ĐỨC ANH
DO $$
DECLARE
    new_user_id UUID;
    existing_user_id UUID;
BEGIN
    SELECT id INTO existing_user_id FROM auth.users WHERE email = 'tducanh2002lc@gmail.com';
    
    IF existing_user_id IS NULL THEN
        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
            is_super_admin, role
        ) VALUES (
            gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
            'tducanh2002lc@gmail.com', crypt('0828888598', gen_salt('bf')), NOW(),
            NOW(), NOW(), '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "ĐỨC ANH"}', false, 'authenticated'
        ) RETURNING id INTO new_user_id;
        
        INSERT INTO public.profiles (
            user_id, full_name, phone, company, role_name, branch, status, approved_at
        )
        SELECT 
            new_user_id, 'ĐỨC ANH', '0828888598', 'RAN Group', 'staff', 'HN35,HN40', 'approved', NOW()
        WHERE NOT EXISTS (
            SELECT 1 FROM public.profiles WHERE user_id = new_user_id
        );
        
        RAISE NOTICE 'Created account for ĐỨC ANH: %', new_user_id;
    ELSE
        UPDATE public.profiles SET
            full_name = 'ĐỨC ANH', phone = '0828888598', company = 'RAN Group',
            role_name = 'staff', branch = 'HN35,HN40', status = 'approved',
            approved_at = COALESCE(approved_at, NOW())
        WHERE user_id = existing_user_id;
        
        RAISE NOTICE 'Updated existing account for ĐỨC ANH: %', existing_user_id;
    END IF;
END $$;

-- 5. Võ Lê phương
DO $$
DECLARE
    new_user_id UUID;
    existing_user_id UUID;
BEGIN
    SELECT id INTO existing_user_id FROM auth.users WHERE email = 'volephuong3502@gmail.com';
    
    IF existing_user_id IS NULL THEN
        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
            is_super_admin, role
        ) VALUES (
            gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
            'volephuong3502@gmail.com', crypt('0945373568', gen_salt('bf')), NOW(),
            NOW(), NOW(), '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Võ Lê phương"}', false, 'authenticated'
        ) RETURNING id INTO new_user_id;
        
        INSERT INTO public.profiles (
            user_id, full_name, phone, company, role_name, branch, status, approved_at
        )
        SELECT 
            new_user_id, 'Võ Lê phương', '0945373568', 'RAN Group', 'staff', 'HN35,HN40', 'approved', NOW()
        WHERE NOT EXISTS (
            SELECT 1 FROM public.profiles WHERE user_id = new_user_id
        );
        
        RAISE NOTICE 'Created account for Võ Lê phương: %', new_user_id;
    ELSE
        UPDATE public.profiles SET
            full_name = 'Võ Lê phương', phone = '0945373568', company = 'RAN Group',
            role_name = 'staff', branch = 'HN35,HN40', status = 'approved',
            approved_at = COALESCE(approved_at, NOW())
        WHERE user_id = existing_user_id;
        
        RAISE NOTICE 'Updated existing account for Võ Lê phương: %', existing_user_id;
    END IF;
END $$;

-- 6. Vũ thanh tùng
DO $$
DECLARE
    new_user_id UUID;
    existing_user_id UUID;
BEGIN
    SELECT id INTO existing_user_id FROM auth.users WHERE email = 'Thanhtung.themask@gmail.com';
    
    IF existing_user_id IS NULL THEN
        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
            is_super_admin, role
        ) VALUES (
            gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
            'Thanhtung.themask@gmail.com', crypt('0942246586', gen_salt('bf')), NOW(),
            NOW(), NOW(), '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Vũ thanh tùng"}', false, 'authenticated'
        ) RETURNING id INTO new_user_id;
        
        INSERT INTO public.profiles (
            user_id, full_name, phone, company, role_name, branch, status, approved_at
        )
        SELECT 
            new_user_id, 'Vũ thanh tùng', '0942246586', 'RAN Group', 'staff', 'HN35,HN40', 'approved', NOW()
        WHERE NOT EXISTS (
            SELECT 1 FROM public.profiles WHERE user_id = new_user_id
        );
        
        RAISE NOTICE 'Created account for Vũ thanh tùng: %', new_user_id;
    ELSE
        UPDATE public.profiles SET
            full_name = 'Vũ thanh tùng', phone = '0942246586', company = 'RAN Group',
            role_name = 'staff', branch = 'HN35,HN40', status = 'approved',
            approved_at = COALESCE(approved_at, NOW())
        WHERE user_id = existing_user_id;
        
        RAISE NOTICE 'Updated existing account for Vũ thanh tùng: %', existing_user_id;
    END IF;
END $$;

-- 7. Mai khương duy
DO $$
DECLARE
    new_user_id UUID;
    existing_user_id UUID;
BEGIN
    SELECT id INTO existing_user_id FROM auth.users WHERE email = 'Mkd1272019@gmail.com';
    
    IF existing_user_id IS NULL THEN
        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
            is_super_admin, role
        ) VALUES (
            gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
            'Mkd1272019@gmail.com', crypt('0335103153', gen_salt('bf')), NOW(),
            NOW(), NOW(), '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Mai khương duy"}', false, 'authenticated'
        ) RETURNING id INTO new_user_id;
        
        INSERT INTO public.profiles (
            user_id, full_name, phone, company, role_name, branch, status, approved_at
        )
        SELECT 
            new_user_id, 'Mai khương duy', '0335103153', 'RAN Group', 'staff', 'HN35,HN40', 'approved', NOW()
        WHERE NOT EXISTS (
            SELECT 1 FROM public.profiles WHERE user_id = new_user_id
        );
        
        RAISE NOTICE 'Created account for Mai khương duy: %', new_user_id;
    ELSE
        UPDATE public.profiles SET
            full_name = 'Mai khương duy', phone = '0335103153', company = 'RAN Group',
            role_name = 'staff', branch = 'HN35,HN40', status = 'approved',
            approved_at = COALESCE(approved_at, NOW())
        WHERE user_id = existing_user_id;
        
        RAISE NOTICE 'Updated existing account for Mai khương duy: %', existing_user_id;
    END IF;
END $$;

-- STEP 3: Verify all accounts were created successfully
SELECT 
    u.email,
    p.full_name,
    p.role_name,
    p.branch,
    p.status,
    p.created_at,
    'Account ready for login' as login_status
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
ORDER BY p.created_at;

-- STEP 4: Final success message
SELECT 
    '✅ All 7 employee accounts processed successfully!' as message,
    'Existing accounts updated, new accounts created' as note,
    'Each account has access to both HN35 and HN40 branches' as access_info;

-- LOGIN CREDENTIALS:
-- 1. khangthitbo123@gmail.com / 0865154423
-- 2. lequocbao240107@gmail.com / 0832041111
-- 3. lanphuongbe110207@gmail.com / 0385658335
-- 4. tducanh2002lc@gmail.com / 0828888598
-- 5. volephuong3502@gmail.com / 0945373568
-- 6. Thanhtung.themask@gmail.com / 0942246586
-- 7. Mkd1272019@gmail.com / 0335103153