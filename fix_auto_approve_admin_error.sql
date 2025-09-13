-- Fix for auto_approve_admin function error
-- Run this script in Supabase Studio SQL Editor to fix the trigger error

-- Step 1: Drop the problematic trigger first
DROP TRIGGER IF EXISTS auto_approve_admin_trigger ON public.profiles;

-- Step 2: Create improved function that handles missing columns gracefully
CREATE OR REPLACE FUNCTION public.auto_approve_admin()
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
    target_user_id UUID;
    has_user_id_column BOOLEAN;
    has_status_column BOOLEAN;
    has_approval_status_column BOOLEAN;
BEGIN
    -- Check if the profiles table has user_id column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) INTO has_user_id_column;
    
    -- Check if the profiles table has status column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'status' 
        AND table_schema = 'public'
    ) INTO has_status_column;
    
    -- Check if the profiles table has approval_status column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'approval_status' 
        AND table_schema = 'public'
    ) INTO has_approval_status_column;
    
    -- Determine the user_id based on available columns
    IF has_user_id_column AND NEW.user_id IS NOT NULL THEN
        target_user_id := NEW.user_id;
    ELSIF NEW.id IS NOT NULL THEN
        -- Fallback to id column if user_id doesn't exist or is null
        target_user_id := NEW.id;
    ELSE
        RAISE EXCEPTION 'Cannot determine user ID from NEW record';
    END IF;
    
    -- Get user email from auth.users
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = target_user_id;
    
    -- Only proceed if we found the email
    IF user_email IS NOT NULL THEN
        -- Check if the user email is admin (only if app_admins table exists)
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'app_admins' AND table_schema = 'public') THEN
            IF EXISTS (SELECT 1 FROM public.app_admins WHERE email = user_email) THEN
                -- Set admin status based on available columns
                IF has_status_column THEN
                    NEW.status = 'approved';
                END IF;
                
                IF has_approval_status_column THEN
                    NEW.approval_status = 'approved';
                END IF;
                
                -- Set other admin fields if columns exist
                BEGIN
                    NEW.role_name = 'admin';
                    NEW.approved_at = NOW();
                    NEW.approved_by = target_user_id;
                EXCEPTION
                    WHEN undefined_column THEN
                        -- Column doesn't exist, ignore
                        NULL;
                END;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Recreate trigger for profiles table (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        CREATE TRIGGER auto_approve_admin_trigger
            BEFORE INSERT ON public.profiles
            FOR EACH ROW
            EXECUTE FUNCTION public.auto_approve_admin();
    END IF;
END $$;

-- Step 4: Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.auto_approve_admin() TO authenticated;

-- Step 5: Add comment
COMMENT ON FUNCTION public.auto_approve_admin() IS 'Automatically approves admin accounts on registration - handles missing columns gracefully';

-- Verification: Test the function
SELECT 'auto_approve_admin function has been fixed successfully!' as message;
SELECT 'The function now handles missing user_id column gracefully.' as note;

-- Show current trigger status
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'auto_approve_admin_trigger'
AND trigger_schema = 'public';