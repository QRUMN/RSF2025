import { supabase } from '../lib/supabase';

export interface Message {
  id: string;
  text: string;
  sender_id: string;
  conversation_id: string;
  created_at: string;
  read_at: string | null;
  sender_type: 'client' | 'coach' | 'admin';
  attachment_url?: string | null;
  attachment_name?: string | null;
}

export interface Conversation {
  id: string;
  client_id: string;
  coach_id: string;
  created_at: string;
  client?: {
    id: string;
    users?: {
      full_name: string;
      avatar_url: string | null;
    };
  };
  coach?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    title?: string | null;
  };
  latestMessage?: Message | null;
  unreadCount?: number;
}

export interface Participant {
  id: string;
  full_name: string;
  title?: string | null;
  avatar_url?: string | null;
  last_seen_at?: string | null;
  users?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export interface AttachmentData {
  url: string;
  filename: string;
}

export const messagingService = {
  /**
   * Fetch conversations for a user (either client or coach)
   */
  async fetchConversations(userId: string, isClient: boolean): Promise<Conversation[]> {
    try {
      // Determine the field to filter on based on user type
      const filterField = isClient ? 'client_id' : 'coach_id';
      
      // Select appropriate fields based on user type
      const selectFields = isClient 
        ? `
          id,
          created_at,
          coach:coach_id (id, full_name, avatar_url, title, last_seen_at)
        `
        : `
          id,
          created_at,
          client:client_id (id, users:user_id (full_name, avatar_url))
        `;
      
      const { data, error } = await supabase
        .from('conversations')
        .select(selectFields)
        .eq(filterField, userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch the latest message and unread count for each conversation
      const conversationsWithDetails = await Promise.all((data || []).map(async (convo) => {
        // Get latest message
        const { data: latestMessage } = await supabase
          .from('messages')
          .select('id, text, created_at, sender_type, read_at')
          .eq('conversation_id', convo.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        // Count unread messages
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: false })
          .eq('conversation_id', convo.id)
          .eq('sender_type', isClient ? 'coach' : 'client')
          .is('read_at', null);

        return {
          ...convo,
          latestMessage: latestMessage || null,
          unreadCount: unreadCount || 0
        };
      }));

      return conversationsWithDetails;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  },

  /**
   * Fetch messages for a specific conversation
   */
  async fetchMessages(conversationId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(conversationId: string, isClient: boolean): Promise<void> {
    try {
      // Mark messages from the other party as read
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('sender_type', isClient ? 'coach' : 'client')
        .is('read_at', null);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  },

  /**
   * Send a new message
   */
  async sendMessage(
    conversationId: string, 
    senderId: string, 
    text: string, 
    senderType: 'client' | 'coach', 
    attachment: File | null = null
  ): Promise<boolean> {
    try {
      let attachmentData = null;
      
      // Upload attachment if present
      if (attachment) {
        attachmentData = await this.uploadAttachment(conversationId, attachment);
      }
      
      // Add message to database
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          sender_type: senderType,
          text: text,
          created_at: new Date().toISOString(),
          attachment_url: attachmentData?.url || null,
          attachment_name: attachmentData?.filename || null
        });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  },

  /**
   * Upload an attachment
   */
  async uploadAttachment(conversationId: string, file: File): Promise<AttachmentData | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `attachments/${conversationId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(filePath);
      
      return {
        url: urlData.publicUrl,
        filename: file.name
      };
    } catch (error) {
      console.error('Error uploading attachment:', error);
      return null;
    }
  },

  /**
   * Fetch participant details (coach or client)
   */
  async fetchParticipantDetails(conversationId: string, isClient: boolean): Promise<Participant | null> {
    try {
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .select('client_id, coach_id')
        .eq('id', conversationId)
        .single();
      
      if (conversationError) throw conversationError;
      
      // If user is client, fetch coach details, otherwise fetch client details
      const participantId = isClient ? conversationData.coach_id : conversationData.client_id;
      
      if (isClient) {
        // Fetch coach details
        const { data, error } = await supabase
          .from('coaches')
          .select('id, full_name, avatar_url, title, last_seen_at')
          .eq('id', participantId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          return {
            id: data.id,
            full_name: data.full_name,
            title: data.title,
            avatar_url: data.avatar_url,
            last_seen_at: data.last_seen_at
          };
        }
      } else {
        // Fetch client details
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, users:user_id (full_name, avatar_url)')
          .eq('user_id', participantId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          return {
            id: data.id,
            full_name: typeof data.users === 'object' && data.users ? 
              (data.users as any).full_name || 'Client' : 'Client',
            avatar_url: typeof data.users === 'object' && data.users ? 
              (data.users as any).avatar_url : null
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching participant details:', error);
      return null;
    }
  },

  /**
   * Create a new conversation
   */
  async createConversation(clientId: string, coachId: string, initialMessage?: string): Promise<string | null> {
    try {
      // Create a new conversation
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          client_id: clientId,
          coach_id: coachId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (conversationError) throw conversationError;
      
      // Create initial message if provided
      if (initialMessage) {
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationData.id,
            sender_id: coachId,
            sender_type: 'coach',
            text: initialMessage,
            created_at: new Date().toISOString()
          });
        
        if (messageError) throw messageError;
      }
      
      return conversationData.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  },

  /**
   * Update coach's last seen timestamp
   */
  async updateLastSeen(coachId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('coaches')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', coachId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating last seen:', error);
    }
  },

  /**
   * Get available coaches for a client to message
   */
  async getAvailableCoaches(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('coaches')
        .select('id, full_name, avatar_url, title')
        .order('full_name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching coaches:', error);
      return [];
    }
  },

  /**
   * Get available clients for a coach to message
   */
  async getAvailableClientsForCoach(coachId: string): Promise<any[]> {
    try {
      // Fetch all client profiles
      const { data: allClients, error: clientsError } = await supabase
        .from('clients')
        .select(`
          id,
          users:user_id (id, full_name, avatar_url)
        `);
        
      if (clientsError) throw clientsError;
      
      // Get existing conversations for this coach
      const { data: existingConvos, error: convosError } = await supabase
        .from('conversations')
        .select('client_id')
        .eq('coach_id', coachId);
      
      if (convosError) throw convosError;
      
      // Filter out clients that already have conversations with this coach
      const existingClientIds = (existingConvos || []).map(convo => convo.client_id);
      const filteredClients = (allClients || []).filter(client => 
        !existingClientIds.includes(client.id)
      );
      
      return filteredClients;
    } catch (error) {
      console.error('Error fetching available clients:', error);
      return [];
    }
  }
};
