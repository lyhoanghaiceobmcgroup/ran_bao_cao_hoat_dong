-- Fix auto_approve_admin function to handle missing user_id field
-- This migration fixes the trigger function error

-- Drop existing trigger first
DROP TRIGGER IF EXISTS auto_approve_admin_trigger ON public.profiles;

-- Create improved function that checks for column existence
CREATE OR REPLACE FUNCTION public.auto_approve_admin()
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
    target_user_id UUID;
BEGIN
    -- Determine the user_id based on available columns
    IF TG_TABLE_NAME = 'profiles' THEN
        -- For profiles table, check if user_id column exists
        IF NEW.user_id IS NOT NULL THEN
            target_user_id := NEW.user_id;
        ELSIF NEW.id IS NOT NULL THEN
            -- Fallback to id column if user_id doesn't exist
            target_user_id := NEW.id;
        ELSE
            RAISE EXCEPTION 'Cannot determine user ID from NEW record';
        END IF;
    ELSE
        -- For other tables, assume id is the user identifier
        target_user_id := NEW.id;
    END IF;
    
    -- Get user email from auth.users
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = target_user_id;
    
    -- Check if the user email is admin (only if app_admins table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'app_admins' AND table_schema = 'public') THEN
        IF EXISTS (SELECT 1 FROM public.app_admins WHERE email = user_email) THEN
            -- Set admin status based on available columns
            IF TG_TABLE_NAME = 'profiles' THEN
                NEW.status = 'approved';
                NEW.role_name = 'admin';
                NEW.approved_at = NOW();
                NEW.approved_by = target_user_id;
                
                -- Also set approval_status if column exists
                BEGIN
                    NEW.approval_status = 'approved';
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

-- Recreate trigger for profiles table
CREATE TRIGGER auto_approve_admin_trigger
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_approve_admin();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.auto_approve_admin() TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.auto_approve_admin() IS 'Automatically approves admin accounts on registration - handles both old and new table structures';

-- Success message
SELECT 'auto_approve_admin function fixed successfully!' as message;