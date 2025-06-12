-- Create meal_plans table
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  daily_plans JSONB NOT NULL DEFAULT '{}'::jsonb,
  coach_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RLS policies for meal_plans
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own meal plans
CREATE POLICY "Users can view their own meal plans" 
  ON public.meal_plans 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow coaches to view and manage meal plans they created
CREATE POLICY "Coaches can manage meal plans they created" 
  ON public.meal_plans 
  USING (auth.uid() = coach_id);

-- Allow admins to manage all meal plans
CREATE POLICY "Admins can manage all meal plans" 
  ON public.meal_plans 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
    )
  );

-- Create conversations table to group messages
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(client_id, coach_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'coach')),
  text TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RLS policies for conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Allow users to view conversations they are part of
CREATE POLICY "Users can view their own conversations" 
  ON public.conversations 
  FOR SELECT 
  USING (auth.uid() = client_id OR auth.uid() = coach_id);

-- Allow users to insert conversations where they are the client
CREATE POLICY "Clients can create conversations" 
  ON public.conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = client_id);

-- Allow coaches to create conversations with their clients
CREATE POLICY "Coaches can create conversations" 
  ON public.conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = coach_id);

-- Create RLS policies for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow users to view messages in conversations they are part of
CREATE POLICY "Users can view messages in their conversations" 
  ON public.messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND (client_id = auth.uid() OR coach_id = auth.uid())
    )
  );

-- Allow users to send messages in their conversations
CREATE POLICY "Users can send messages in their conversations" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND (
        (client_id = auth.uid() AND sender_type = 'client') OR 
        (coach_id = auth.uid() AND sender_type = 'coach')
      )
    )
  );

-- Allow users to update read status of messages sent to them
CREATE POLICY "Users can mark messages as read" 
  ON public.messages 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND (
        (client_id = auth.uid() AND sender_type = 'coach') OR 
        (coach_id = auth.uid() AND sender_type = 'client')
      )
    )
  );

-- Allow admins to manage all messages and conversations
CREATE POLICY "Admins can manage all messages" 
  ON public.messages 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all conversations" 
  ON public.conversations 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
    )
  );

-- Create coaches table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.coaches (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  title TEXT NOT NULL,
  avatar_url TEXT,
  last_seen_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON public.meal_plans (user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_coach_id ON public.meal_plans (coach_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_status ON public.meal_plans (status);
CREATE INDEX IF NOT EXISTS idx_meal_plans_dates ON public.meal_plans (start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON public.conversations (client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_coach_id ON public.conversations (coach_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations (last_message_at);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages (created_at);
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON public.messages (read_at);

-- Create function to update last_message_at in conversation when a message is inserted
CREATE OR REPLACE FUNCTION update_conversation_last_message_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update conversation timestamp
CREATE TRIGGER update_conversation_timestamp
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_last_message_timestamp();
