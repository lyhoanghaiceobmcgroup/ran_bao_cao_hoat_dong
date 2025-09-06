-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'staff');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "System can insert wallets" ON public.ran_wallets;
DROP POLICY IF EXISTS "System can update wallets" ON public.ran_wallets;
DROP POLICY IF EXISTS "System can insert ledger entries" ON public.ran_ledger;
DROP POLICY IF EXISTS "System can insert payment intents" ON public.payment_intents;
DROP POLICY IF EXISTS "System can update payment intents" ON public.payment_intents;
DROP POLICY IF EXISTS "Admin can manage bank transactions" ON public.bank_transactions;

-- Create secure RLS policies for ran_wallets
CREATE POLICY "Service role can manage wallets" ON public.ran_wallets
FOR ALL TO service_role USING (true);

-- Create secure RLS policies for ran_ledger  
CREATE POLICY "Service role can manage ledger" ON public.ran_ledger
FOR ALL TO service_role USING (true);

-- Create secure RLS policies for payment_intents
CREATE POLICY "Service role can manage payment intents" ON public.payment_intents
FOR ALL TO service_role USING (true);

-- Create secure RLS policies for bank_transactions
CREATE POLICY "Admins can view bank transactions" ON public.bank_transactions
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage bank transactions" ON public.bank_transactions
FOR ALL TO service_role USING (true);

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Service role can manage user roles" ON public.user_roles
FOR ALL TO service_role USING (true);