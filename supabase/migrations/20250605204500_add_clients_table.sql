-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_session TIMESTAMP WITH TIME ZONE,
  membership_type TEXT DEFAULT 'monthly',
  membership_status TEXT DEFAULT 'active',
  notes TEXT,
  
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Add RLS policies
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage all clients
CREATE POLICY admin_all_clients ON public.clients
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid() AND admins.status = 'active'
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS clients_email_idx ON public.clients (email);
CREATE INDEX IF NOT EXISTS clients_membership_status_idx ON public.clients (membership_status);

-- Add comment
COMMENT ON TABLE public.clients IS 'Stores information about fitness clients';
