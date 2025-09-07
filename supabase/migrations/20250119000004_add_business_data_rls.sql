-- Migration: Add RLS policies for business data tables
-- Ensures only approved users can access business data

-- Function to check if user is approved
-- This function handles both old (id-based) and new (user_id-based) profiles table structure
CREATE OR REPLACE FUNCTION public.is_user_approved()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    has_user_id_column BOOLEAN;
    result BOOLEAN := FALSE;
BEGIN
    -- Check if profiles table has user_id column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) INTO has_user_id_column;
    
    -- Use appropriate column based on table structure
    IF has_user_id_column THEN
        -- New structure: profiles has user_id column
        SELECT EXISTS (
            SELECT 1 FROM public.profiles
            WHERE user_id = auth.uid()
            AND status = 'approved'
        ) INTO result;
    ELSE
        -- Old structure: profiles uses id as primary key
        SELECT EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND (approval_status = 'approved' OR status = 'approved')
        ) INTO result;
    END IF;
    
    RETURN result;
END;
$$;

-- Enable RLS on shift_reports if not already enabled
ALTER TABLE IF EXISTS public.shift_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for shift_reports
DROP POLICY IF EXISTS "Users can view own shift reports" ON public.shift_reports;
DROP POLICY IF EXISTS "Users can create own shift reports" ON public.shift_reports;
DROP POLICY IF EXISTS "Users can update own shift reports" ON public.shift_reports;
DROP POLICY IF EXISTS "Managers can view branch shift reports" ON public.shift_reports;
DROP POLICY IF EXISTS "Center role can view all shift reports" ON public.shift_reports;

-- Create new RLS policies for shift_reports (approved users only)
CREATE POLICY "Approved users can view own shift reports" ON public.shift_reports
  FOR SELECT USING (
    auth.uid() = user_id AND public.is_user_approved()
  );

CREATE POLICY "Approved users can create own shift reports" ON public.shift_reports
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND public.is_user_approved()
  );

CREATE POLICY "Approved users can update own shift reports" ON public.shift_reports
  FOR UPDATE USING (
    auth.uid() = user_id AND public.is_user_approved()
  );

CREATE POLICY "Approved managers can view branch shift reports" ON public.shift_reports
  FOR SELECT USING (
    public.is_user_approved() AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role_name IN ('manager', 'central', 'admin')
      AND status = 'approved'
      AND (role_name IN ('central', 'admin') OR branch = shift_reports.branch)
    )
  );

-- Enable RLS on ran_wallets if exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ran_wallets' AND table_schema = 'public') THEN
    ALTER TABLE public.ran_wallets ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies
    DROP POLICY IF EXISTS "Service role can manage wallets" ON public.ran_wallets;
    
    -- Create new policy for approved users only
    CREATE POLICY "Approved users can access wallets" ON public.ran_wallets
      FOR ALL USING (public.is_user_approved());
      
    -- Keep service role access
    CREATE POLICY "Service role can manage wallets" ON public.ran_wallets
      FOR ALL TO service_role USING (true);
  END IF;
END $$;

-- Enable RLS on ran_ledger if exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ran_ledger' AND table_schema = 'public') THEN
    ALTER TABLE public.ran_ledger ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies
    DROP POLICY IF EXISTS "Service role can manage ledger" ON public.ran_ledger;
    
    -- Create new policy for approved users only
    CREATE POLICY "Approved users can access ledger" ON public.ran_ledger
      FOR ALL USING (public.is_user_approved());
      
    -- Keep service role access
    CREATE POLICY "Service role can manage ledger" ON public.ran_ledger
      FOR ALL TO service_role USING (true);
  END IF;
END $$;

-- Enable RLS on payment_intents if exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_intents' AND table_schema = 'public') THEN
    ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies
    DROP POLICY IF EXISTS "Service role can manage payment intents" ON public.payment_intents;
    
    -- Create new policy for approved users only
    CREATE POLICY "Approved users can access payment intents" ON public.payment_intents
      FOR ALL USING (public.is_user_approved());
      
    -- Keep service role access
    CREATE POLICY "Service role can manage payment intents" ON public.payment_intents
      FOR ALL TO service_role USING (true);
  END IF;
END $$;

-- Enable RLS on bank_transactions if exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bank_transactions' AND table_schema = 'public') THEN
    ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies
    DROP POLICY IF EXISTS "Admins can view bank transactions" ON public.bank_transactions;
    DROP POLICY IF EXISTS "Service role can manage bank transactions" ON public.bank_transactions;
    
    -- Create new policy for approved admins only
    CREATE POLICY "Approved admins can view bank transactions" ON public.bank_transactions
      FOR SELECT USING (
        public.is_user_approved() AND
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE user_id = auth.uid()
          AND role_name IN ('admin', 'central')
          AND status = 'approved'
        )
      );
      
    -- Keep service role access
    CREATE POLICY "Service role can manage bank transactions" ON public.bank_transactions
      FOR ALL TO service_role USING (true);
  END IF;
END $$;

-- Update user_roles RLS policies to require approved status
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles' AND table_schema = 'public') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
    DROP POLICY IF EXISTS "Central role can manage all user roles" ON public.user_roles;
    
    -- Create new policies requiring approved status
    CREATE POLICY "Approved users can view their own roles" ON public.user_roles
      FOR SELECT USING (
        user_id = auth.uid() AND public.is_user_approved()
      );
    
    CREATE POLICY "Approved central role can manage all user roles" ON public.user_roles
      FOR ALL USING (
        public.is_user_approved() AND
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE user_id = auth.uid()
          AND role_name IN ('central', 'admin')
          AND status = 'approved'
        )
      );
      
    -- Keep service role access
    CREATE POLICY "Service role can manage user roles" ON public.user_roles
      FOR ALL TO service_role USING (true);
  END IF;
END $$;

-- Grant execute permission on the helper function
GRANT EXECUTE ON FUNCTION public.is_user_approved() TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION public.is_user_approved() IS 'Helper function to check if current user has approved status in profiles table';

-- Success message
SELECT 'Business data RLS policies updated successfully! Only approved users can access business data.' as message;