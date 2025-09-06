-- Add central role to app_role enum
ALTER TYPE public.app_role ADD VALUE 'central';

-- Add account approval columns to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN account_status TEXT DEFAULT 'pending' CHECK (account_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN approved_by UUID REFERENCES auth.users(id),
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN rejected_reason TEXT,
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_roles_updated_at 
    BEFORE UPDATE ON public.user_roles 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Update existing records to have approved status (for demo purposes)
UPDATE public.user_roles SET account_status = 'approved' WHERE account_status = 'pending';

-- Create function to get account status
CREATE OR REPLACE FUNCTION public.get_account_status(_user_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT account_status
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Add RLS policy for account management
CREATE POLICY "Central role can manage all user roles" ON public.user_roles
FOR ALL TO authenticated 
USING (public.has_role(auth.uid(), 'central') OR user_id = auth.uid());