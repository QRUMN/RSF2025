-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  client_id UUID,
  client_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('personal_training', 'massage', 'consultation', 'vendor')),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled', 'completed')),
  staff_id UUID,
  staff_name TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key to clients table if it exists
  CONSTRAINT fk_client FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL
);

-- Add RLS policies
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage all appointments
CREATE POLICY admin_all_appointments ON public.appointments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid() AND admins.status = 'active'
    )
  );

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS appointments_client_id_idx ON public.appointments (client_id);
CREATE INDEX IF NOT EXISTS appointments_start_time_idx ON public.appointments (start_time);
CREATE INDEX IF NOT EXISTS appointments_type_idx ON public.appointments (type);
CREATE INDEX IF NOT EXISTS appointments_status_idx ON public.appointments (status);

-- Add comment
COMMENT ON TABLE public.appointments IS 'Stores appointment and booking information';
