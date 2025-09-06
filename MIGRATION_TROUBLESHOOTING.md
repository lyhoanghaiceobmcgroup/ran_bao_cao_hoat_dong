# Migration Troubleshooting Guide

## Common Issues and Solutions

### 1. "relation 'public.user_roles' does not exist" Error

**Problem**: The admin RPC migration tries to use the `user_roles` table before it's created.

**Root Cause**: Migration files must be run in chronological order. The `user_roles` table is created in an earlier migration file.

**Solution**:
1. Ensure all migrations are run in the correct order
2. Check that the base schema migration (`20250817192945_1b40085b-da85-49e6-badf-4d98015aa7a8.sql`) has been applied first
3. Run migrations sequentially using `supabase db reset` or `supabase db push`

### 2. "type app_role does not exist" Error

**Problem**: The migration tries to use the `app_role` enum type before it's created.

**Root Cause**: The enum is created in an earlier migration, but the admin RPC migration was trying to recreate it.

**Solution**: ✅ **FIXED** - Removed duplicate enum creation from admin RPC migration.

### 3. Docker Connection Issues

**Problem**: `supabase db reset` fails with Docker connection errors.

**Solutions**:
1. **Install Docker Desktop**: Follow [official docs](https://docs.docker.com/desktop)
2. **Start Docker Desktop** before running Supabase commands
3. **Run as Administrator** if on Windows
4. **Alternative**: Use Supabase hosted database for testing

## Migration Order

The correct migration order is:

1. `20250817192945_1b40085b-da85-49e6-badf-4d98015aa7a8.sql` - Creates base schema
   - Creates `app_role` enum
   - Creates `user_roles` table
   - Sets up RLS policies

2. `20250817193032_ff5164db-9599-4147-919a-80e53820b7a4.sql` - Additional schema

3. `20250818051457_40688c95-ff49-4e93-8ff3-f37e11afd710.sql` - More schema updates

4. `20250119000000_add_account_approval_system.sql` - Adds approval system
   - Adds `central` role to enum
   - Adds approval columns to `user_roles`

5. `20250119000001_add_ceo_account.sql` - Creates CEO account

6. `20250119000002_add_admin_only_rpc.sql` - **Admin RPC functions** ✅
   - Creates SECURITY DEFINER functions
   - Requires `user_roles` table and `app_role` enum

## Testing Without Docker

If Docker is not available, you can test the RPC functions using:

1. **Supabase Dashboard**: Copy the migration SQL to the SQL editor
2. **Direct Database Connection**: Use `psql` or similar tools
3. **Test Script**: Use the provided `test_admin_rpc.sql` file

## Verification Steps

1. **Check Schema Prerequisites**:
   ```sql
   -- Check if app_role enum exists
   SELECT typname FROM pg_type WHERE typname = 'app_role';
   
   -- Check if user_roles table exists
   SELECT table_name FROM information_schema.tables 
   WHERE table_name = 'user_roles' AND table_schema = 'public';
   ```

2. **Test RPC Functions**:
   ```sql
   -- This should work for admin users
   SELECT * FROM admin_get_all_users();
   
   -- This should return system stats for admin users
   SELECT * FROM admin_get_system_stats();
   ```

3. **Check Function Permissions**:
   ```sql
   -- List all admin RPC functions
   SELECT routine_name, routine_type, security_type 
   FROM information_schema.routines 
   WHERE routine_name LIKE 'admin_%' 
   AND routine_schema = 'public';
   ```

## Next Steps

1. **For Local Development**: Install Docker Desktop and run `supabase db reset`
2. **For Production**: Apply migrations using Supabase CLI or Dashboard
3. **For Testing**: Use the test script or Supabase SQL editor

## Admin RPC Functions Available

- `admin_get_all_users()` - Get all user accounts
- `admin_update_account_status(user_id, status, reason)` - Update account approval
- `admin_delete_user(user_id)` - Delete user account
- `admin_get_system_stats()` - Get system statistics

All functions require admin role and approved account status.