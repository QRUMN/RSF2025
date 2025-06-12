import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { MessageList } from '../../components/messaging/MessageList';
import { ConversationView } from '../../components/messaging/ConversationView';
import { Button } from '../../components/ui/Button';
import { Search, Plus, Users, UserX, X, CheckCircle2, Loader2 } from 'lucide-react';

export default function AdminMessagingPage() {
  const { user } = useAuth();
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const [availableClients, setAvailableClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConversations();
      subscribeToNewMessages();
    }
  }, [user]);
  
  const fetchAvailableClients = async () => {
    setClientsLoading(true);
    try {
      // Fetch all client profiles
      const { data, error } = await supabase
        .from('clients')
        .select(`
          id,
          users:user_id (id, full_name, avatar_url)
        `);
        
      if (error) throw error;
      
      // Filter out clients that already have conversations with this coach
      const existingClientIds = conversations.map(convo => convo.client?.id);
      const filteredClients = data?.filter(client => 
        !existingClientIds.includes(client.id)
      ) || [];
      
      setAvailableClients(filteredClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setClientsLoading(false);
    }
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      // For admin/coaches, we get conversations where they are the coach
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          created_at,
          client:client_id (id, users:user_id (full_name, avatar_url))
        `)
        .eq('coach_id', user?.id)
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
          .eq('sender_type', 'client')
          .is('read_at', null);

        return {
          ...convo,
          coach: { 
            id: user?.id,
            full_name: user?.user_metadata?.full_name || 'Coach'
          },
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
        filter: `coach_id=eq.${user?.id}`
      }, () => {
        // Refresh conversations when a new message is received
        fetchConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  };

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversation(conversationId);
  };

  const filteredConversations = conversations.filter(convo => 
    convo.client?.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (convo.latestMessage?.text && convo.latestMessage.text.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-4 py-6 flex flex-col h-[calc(100vh-80px)]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-light">Client Messages</h1>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-light/50" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-dark border border-primary/20 rounded-lg text-light placeholder:text-light/30 focus:outline-none focus:border-primary w-64"
            />
          </div>
          
          <Button 
            variant="primary" 
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setIsNewConversationModalOpen(true);
              fetchAvailableClients();
              setSelectedClientId(null);
              setClientSearchTerm('');
            }}
          >
            New Conversation
          </Button>
        </div>
      </div>
      
      <div className="flex flex-1 gap-6 h-full overflow-hidden">
        {/* Sidebar */}
        <div className="w-full max-w-xs bg-dark-surface rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-primary/20 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-light flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary" /> Clients
            </h2>
            
            <div className="text-xs text-light/50">
              {conversations.length} Total
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {filteredConversations.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center h-full p-4">
                {searchTerm ? (
                  <>
                    <UserX className="w-10 h-10 text-light/30 mb-4" />
                    <p className="text-light/50 text-center">No conversations matching "{searchTerm}"</p>
                  </>
                ) : (
                  <>
                    <Users className="w-10 h-10 text-light/30 mb-4" />
                    <p className="text-light/50 text-center">No conversations yet</p>
                    <p className="text-light/50 text-center text-xs mt-1">Create one by clicking "New Conversation"</p>
                  </>
                )}
              </div>
            ) : (
              <MessageList 
                conversations={filteredConversations}
                activeConversationId={activeConversation}
                onSelectConversation={handleConversationSelect}
                loading={loading}
              />
            )}
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 bg-dark-surface rounded-xl overflow-hidden flex flex-col">
          {activeConversation ? (
            <ConversationView 
              conversationId={activeConversation}
              refreshConversations={fetchConversations}
              isUserClient={false}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-light/50">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-xl font-medium">Select a conversation</h3>
                <p className="mt-2">Choose a client to view your message history.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* New Conversation Modal */}
      {isNewConversationModalOpen && (
        <div className="fixed inset-0 bg-dark/80 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-dark-surface rounded-xl w-full max-w-md shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-primary/20 flex justify-between items-center">
              <h3 className="text-xl font-bold text-light">New Conversation</h3>
              <button 
                className="text-light/50 hover:text-light" 
                onClick={() => setIsNewConversationModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-light/70 mb-2 text-sm">Select Client</label>
                <div className="relative mb-4">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-light/50" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={clientSearchTerm}
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-dark border border-primary/20 rounded-lg text-light placeholder:text-light/30 focus:outline-none focus:border-primary w-full"
                  />
                </div>
                
                <div className="max-h-64 overflow-y-auto space-y-2 rounded-lg">
                  {clientsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                  ) : availableClients.length === 0 ? (
                    <div className="text-center py-8 text-light/50">
                      {clientSearchTerm ? (
                        <p>No clients matching "{clientSearchTerm}"</p>
                      ) : (
                        <p>All clients already have conversations</p>
                      )}
                    </div>
                  ) : (
                    availableClients
                      .filter(client => 
                        !clientSearchTerm || 
                        client.users?.full_name?.toLowerCase().includes(clientSearchTerm.toLowerCase())
                      )
                      .map(client => (
                        <div 
                          key={client.id} 
                          className={`
                            flex items-center p-3 rounded-lg cursor-pointer
                            ${selectedClientId === client.id ? 'bg-primary/20 border border-primary/30' : 'border border-primary/10 hover:bg-primary/10'}
                          `}
                          onClick={() => setSelectedClientId(client.id)}
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden mr-3">
                            {client.users?.avatar_url ? (
                              <img 
                                src={client.users.avatar_url} 
                                alt={client.users.full_name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Users className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-light">
                              {client.users?.full_name || 'Unnamed Client'}
                            </div>
                          </div>
                          {selectedClientId === client.id && (
                            <CheckCircle2 className="w-5 h-5 text-primary ml-2" />
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsNewConversationModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  disabled={!selectedClientId || creatingConversation}
                  onClick={createNewConversation}
                >
                  {creatingConversation ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Start Conversation'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  async function createNewConversation() {
    if (!selectedClientId || !user) return;
    
    setCreatingConversation(true);
    try {
      // Create a new conversation
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          client_id: selectedClientId,
          coach_id: user.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (conversationError) throw conversationError;
      
      // Create a welcome message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationData.id,
          sender_id: user.id,
          sender_type: 'coach',
          text: 'Hello! How can I help you today?',
          created_at: new Date().toISOString()
        });
      
      if (messageError) throw messageError;
      
      // Close the modal and refresh conversations
      setIsNewConversationModalOpen(false);
      await fetchConversations();
      
      // Set the newly created conversation as active
      setActiveConversation(conversationData.id);
      
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setCreatingConversation(false);
    }
  }
}
