import { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MessageList } from '../components/messaging/MessageList';
import { ConversationView } from '../components/messaging/ConversationView';
import { Inbox, Users, Plus, Search, X, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { messagingService, Conversation } from '../services/messagingService';

export default function MessagingPage() {
  const { user } = useAuth();
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const [availableCoaches, setAvailableCoaches] = useState<any[]>([]);
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
  const [coachSearchTerm, setCoachSearchTerm] = useState('');
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [coachesLoading, setCoachesLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConversations();
      subscribeToNewMessages();
    }
  }, [user]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      if (!user?.id) return;
      
      const conversationsData = await messagingService.fetchConversations(user.id, true);
      setConversations(conversationsData);

      // Auto-select the first conversation if none is selected
      if (!activeConversation && conversationsData.length > 0) {
        setActiveConversation(conversationsData[0].id);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAvailableCoaches = async () => {
    setCoachesLoading(true);
    try {
      const coaches = await messagingService.getAvailableCoaches();
      setAvailableCoaches(coaches);
    } catch (error) {
      console.error('Error fetching coaches:', error);
    } finally {
      setCoachesLoading(false);
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
  
  const createNewConversation = async () => {
    if (!selectedCoachId || !user?.id) return;
    
    setCreatingConversation(true);
    try {
      const conversationId = await messagingService.createConversation(
        user.id,
        selectedCoachId,
        'Hello! I would like to start a conversation with you.'
      );
      
      if (conversationId) {
        // Close the modal and refresh conversations
        setIsNewConversationModalOpen(false);
        await fetchConversations();
        
        // Set the newly created conversation as active
        setActiveConversation(conversationId);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setCreatingConversation(false);
    }
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsNewConversationModalOpen(true);
                  fetchAvailableCoaches();
                  setSelectedCoachId(null);
                  setCoachSearchTerm('');
                }}
                className="text-primary hover:bg-primary/10"
              >
                <Plus className="w-4 h-4" />
              </Button>
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
      
      {/* New Conversation Modal */}
      {isNewConversationModalOpen && (
        <div className="fixed inset-0 bg-dark/80 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-dark-surface rounded-xl w-full max-w-md shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-primary/20 flex justify-between items-center">
              <h3 className="text-xl font-bold text-light">Message a Coach</h3>
              <button 
                className="text-light/50 hover:text-light" 
                onClick={() => setIsNewConversationModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-light/70 mb-2 text-sm">Select Coach</label>
                <div className="relative mb-4">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-light/50" />
                  <input
                    type="text"
                    placeholder="Search coaches..."
                    value={coachSearchTerm}
                    onChange={(e) => setCoachSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-dark border border-primary/20 rounded-lg text-light placeholder:text-light/30 focus:outline-none focus:border-primary w-full"
                  />
                </div>
                
                <div className="max-h-64 overflow-y-auto space-y-2 rounded-lg">
                  {coachesLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                  ) : availableCoaches.length === 0 ? (
                    <div className="text-center py-8 text-light/50">
                      <p>No coaches available at the moment</p>
                    </div>
                  ) : (
                    availableCoaches
                      .filter(coach => 
                        !coachSearchTerm || 
                        coach.full_name?.toLowerCase().includes(coachSearchTerm.toLowerCase())
                      )
                      .map(coach => (
                        <div 
                          key={coach.id} 
                          className={`
                            flex items-center p-3 rounded-lg cursor-pointer
                            ${selectedCoachId === coach.id ? 'bg-primary/20 border border-primary/30' : 'border border-primary/10 hover:bg-primary/10'}
                          `}
                          onClick={() => setSelectedCoachId(coach.id)}
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden mr-3">
                            {coach.avatar_url ? (
                              <img 
                                src={coach.avatar_url} 
                                alt={coach.full_name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Users className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-light">
                              {coach.full_name || 'Unnamed Coach'}
                            </div>
                            {coach.title && (
                              <div className="text-xs text-light/50">{coach.title}</div>
                            )}
                          </div>
                          {selectedCoachId === coach.id && (
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
                  disabled={!selectedCoachId || creatingConversation}
                  onClick={createNewConversation}
                >
                  {creatingConversation ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting...
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
    </MainLayout>
  );
}
