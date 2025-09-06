-- Create admin-only RPC function with SECURITY DEFINER
-- This function can only be called by users with admin role

-- Example admin-only function to get all user accounts
CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  role app_role,
  account_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- Check if the calling user has admin role
  SELECT 
    ur.user_id,
    au.email,
    ur.role,
    ur.account_status,
    ur.created_at
  FROM public.user_roles ur
  JOIN auth.users au ON ur.user_id = au.id
  WHERE EXISTS (
    SELECT 1 
    FROM public.user_roles caller_role
    WHERE caller_role.user_id = auth.uid()
      AND caller_role.role = 'admin'
      AND caller_role.account_status = 'approved'
  )
$$;

-- Example admin-only function to update user account status
CREATE OR REPLACE FUNCTION public.admin_update_account_status(
  _user_id UUID,
  _status TEXT,
  _rejected_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if the calling user has admin role
  IF NOT EXISTS (
    SELECT 1 
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
      AND account_status = 'approved'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Validate status
  IF _status NOT IN ('pending', 'approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status: %', _status;
  END IF;

  -- Update the user account status
  UPDATE public.user_roles
  SET 
    account_status = _status,
    approved_by = CASE WHEN _status IN ('approved', 'rejected') THEN auth.uid() ELSE NULL END,
    approved_at = CASE WHEN _status IN ('approved', 'rejected') THEN now() ELSE NULL END,
    rejected_reason = CASE WHEN _status = 'rejected' THEN _rejected_reason ELSE NULL END,
    updated_at = now()
  WHERE user_id = _user_id;

  RETURN FOUND;
END;
$$;

-- Example admin-only function to delete user account
CREATE OR REPLACE FUNCTION public.admin_delete_user(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if the calling user has admin role
  IF NOT EXISTS (
    SELECT 1 
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
      AND account_status = 'approved'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Prevent admin from deleting themselves
  IF _user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account';
  END IF;

  -- Delete from user_roles first (due to foreign key)
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  
  -- Delete from auth.users (this will cascade to other tables)
  DELETE FROM auth.users WHERE id = _user_id;

  RETURN FOUND;
END;
$$;

-- Example admin-only function to get system statistics
CREATE OR REPLACE FUNCTION public.admin_get_system_stats()
RETURNS JSON
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT json_build_object(
    'total_users', (
      SELECT COUNT(*) FROM public.user_roles
    ),
    'pending_approvals', (
      SELECT COUNT(*) FROM public.user_roles WHERE account_status = 'pending'
    ),
    'approved_users', (
      SELECT COUNT(*) FROM public.user_roles WHERE account_status = 'approved'
    ),
    'rejected_users', (
      SELECT COUNT(*) FROM public.user_roles WHERE account_status = 'rejected'
    ),
    'users_by_role', (
      SELECT json_object_agg(role, count)
      FROM (
        SELECT role, COUNT(*) as count
        FROM public.user_roles
        GROUP BY role
      ) role_counts
    )
  )
  WHERE EXISTS (
    SELECT 1 
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
      AND account_status = 'approved'
  )
$$;

-- Grant execute permissions to authenticated users
-- (The functions themselves will check for admin role)
GRANT EXECUTE ON FUNCTION public.admin_get_all_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_account_status(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_system_stats() TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION public.admin_get_all_users() IS 'Admin-only function to retrieve all user accounts with their roles and status';
COMMENT ON FUNCTION public.admin_update_account_status(UUID, TEXT, TEXT) IS 'Admin-only function to update user account approval status';
COMMENT ON FUNCTION public.admin_delete_user(UUID) IS 'Admin-only function to delete a user account (cannot delete own account)';
COMMENT ON FUNCTION public.admin_get_system_stats() IS 'Admin-only function to get system statistics including user counts and role distribution';