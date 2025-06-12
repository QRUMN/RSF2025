import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MessageList } from '../components/messaging/MessageList';
import { ConversationView } from '../components/messaging/ConversationView';
import { Inbox, Users, Settings } from 'lucide-react';

export default function MessagingPage() {
  const { user } = useAuth();
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConversations();
      subscribeToNewMessages();
    }
  }, [user]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          created_at,
          coach:coach_id (id, full_name, avatar_url, title)
        `)
        .eq('client_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch the latest message for each conversation
      const conversationsWithLatestMessage = await Promise.all((data || []).map(async (convo) => {
        const { data: latestMessage } = await supabase
          .from('messages')
          .select('text, created_at, sender_type, read_at')
          .eq('conversation_id', convo.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        // Count unread messages
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: false })
          .eq('conversation_id', convo.id)
          .eq('sender_type', 'coach')
          .is('read_at', null);

        return {
          ...convo,
          latestMessage: latestMessage || null,
          unreadCount: unreadCount || 0
        };
      }));

      setConversations(conversationsWithLatestMessage);

      // Auto-select the first conversation if none is selected
      if (!activeConversation && conversationsWithLatestMessage.length > 0) {
        setActiveConversation(conversationsWithLatestMessage[0].id);
      }

    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNewMessages = () => {
    const subscription = supabase
      .channel('public:messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `client_id=eq.${user?.id}`
      }, () => {
        // Refresh conversations when a new message is received
        fetchConversations();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversation(conversationId);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 flex flex-col h-[calc(100vh-80px)]">
        <h1 className="text-3xl font-bold text-light mb-6">Messaging</h1>
        
        <div className="flex flex-1 gap-6 h-full overflow-hidden">
          {/* Sidebar */}
          <div className="w-full max-w-xs bg-dark-surface rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-primary/20 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-light flex items-center">
                <Inbox className="w-5 h-5 mr-2 text-primary" /> Conversations
              </h2>
            </div>
            
            <div className="overflow-y-auto flex-1">
              <MessageList 
                conversations={conversations}
                activeConversationId={activeConversation}
                onSelectConversation={handleConversationSelect}
                loading={loading}
              />
            </div>
            
            <div className="p-4 border-t border-primary/20">
              <div className="flex items-center text-light/70 text-sm">
                <Users className="w-4 h-4 mr-2 text-primary" />
                <span>Your Coach</span>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1 bg-dark-surface rounded-xl overflow-hidden flex flex-col">
            {activeConversation ? (
              <ConversationView 
                conversationId={activeConversation}
                refreshConversations={fetchConversations}
                isUserClient={true}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-light/50">
                  <Inbox className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <h3 className="text-xl font-medium">No conversation selected</h3>
                  <p className="mt-2">Select a conversation from the sidebar to view messages.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
