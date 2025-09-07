-- Migration: Create admin account for lyhoanghaiceo@gmail.com
-- This creates the admin profile that can approve other accounts

-- Insert admin profile (will be created when user registers)
-- This is a placeholder - the actual profile will be created via the registration process
-- But we need to ensure the admin email is recognized

-- Create function to automatically approve admin accounts
CREATE OR REPLACE FUNCTION public.auto_approve_admin()
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
BEGIN
    -- Get user email from auth.users
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = NEW.user_id;
    
    -- Check if the user email is admin
    IF EXISTS (SELECT 1 FROM public.app_admins WHERE email = user_email) THEN
        NEW.status = 'approved';
        NEW.role_name = 'admin';
        NEW.approved_at = NOW();
        NEW.approved_by = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-approve admin
DROP TRIGGER IF EXISTS auto_approve_admin_trigger ON public.profiles;
CREATE TRIGGER auto_approve_admin_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_approve_admin();

-- Also create a function to manually set admin status if needed
CREATE OR REPLACE FUNCTION public.set_admin_status(
  admin_email TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = admin_email;
  
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', admin_email;
  END IF;
  
  -- Update or insert profile
  INSERT INTO public.profiles (
    user_id,
    full_name,
    role_name,
    status,
    approved_at,
    approved_by
  ) VALUES (
    admin_user_id,
    'System Administrator',
    'admin',
    'approved',
    NOW(),
    admin_user_id
  )
  ON CONFLICT (user_id) DO UPDATE SET
    role_name = 'admin',
    status = 'approved',
    approved_at = NOW(),
    approved_by = admin_user_id;
    
  RETURN TRUE;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.set_admin_status(TEXT) TO service_role;

-- Comments
COMMENT ON FUNCTION public.auto_approve_admin() IS 'Automatically approves admin accounts on registration';
COMMENT ON FUNCTION public.set_admin_status(TEXT) IS 'Manually set admin status for a user by email';

-- Success message
SELECT 'Admin account setup completed. Admin email will be auto-approved on registration.' as message;