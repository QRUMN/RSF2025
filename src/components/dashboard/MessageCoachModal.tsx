import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

interface Message {
  id: string;
  text: string;
  sender_id: string;
  conversation_id: string;
  created_at: string;
  read_at: string | null;
  sender_type: 'client' | 'coach';
}

interface Coach {
  id: string;
  full_name: string;
  title: string;
  avatar_url: string | null;
  last_seen_at: string | null;
}

interface MessageCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MessageCoachModal: React.FC<MessageCoachModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [coach, setCoach] = useState<Coach | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch coach and conversation data
  useEffect(() => {
    if (isOpen && user) {
      fetchCoachAndConversation();
    }
  }, [isOpen, user]);

  // Subscribe to new messages when conversation is loaded
  useEffect(() => {
    if (!conversationId) return;
    
    // Subscribe to new messages in this conversation
    const subscription = supabase
      .channel(`conversation:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        const newMessage = payload.new as Message;
        setMessages(prev => [...prev, newMessage]);
      })
      .subscribe();
    
    // Mark messages as read when opened
    markMessagesAsRead();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input and scroll to bottom when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollToBottom();
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const fetchCoachAndConversation = async () => {
    setLoading(true);
    try {
      // First get the user's assigned coach
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('coach_id')
        .eq('user_id', user?.id)
        .single();
      
      if (userError) throw userError;
      
      if (userData?.coach_id) {
        // Get coach details
        const { data: coachData, error: coachError } = await supabase
          .from('coaches')
          .select('id, full_name, title, avatar_url, last_seen_at')
          .eq('id', userData.coach_id)
          .single();
        
        if (coachError) throw coachError;
        setCoach(coachData);
        
        // Find or create conversation
        const { data: conversationData, error: conversationError } = await supabase
          .from('conversations')
          .select('id')
          .eq('client_id', user?.id)
          .eq('coach_id', userData.coach_id)
          .maybeSingle();
        
        if (conversationError && conversationError.code !== 'PGRST116') throw conversationError;
        
        if (conversationData) {
          setConversationId(conversationData.id);
          fetchMessages(conversationData.id);
        } else {
          // Create new conversation if none exists
          const { data: newConversation, error: newConversationError } = await supabase
            .from('conversations')
            .insert({
              client_id: user?.id,
              coach_id: userData.coach_id,
              created_at: new Date().toISOString()
            })
            .select('id')
            .single();
          
          if (newConversationError) throw newConversationError;
          
          setConversationId(newConversation.id);
          
          // Add welcome message from coach
          const { error: welcomeMessageError } = await supabase
            .from('messages')
            .insert({
              conversation_id: newConversation.id,
              sender_id: userData.coach_id,
              sender_type: 'coach',
              text: `Hi! I'm ${coachData.full_name}, your personal fitness coach. How can I help you today?`,
              created_at: new Date().toISOString()
            });
          
          if (welcomeMessageError) throw welcomeMessageError;
          
          fetchMessages(newConversation.id);
        }
      }
    } catch (error) {
      console.error('Error fetching coach and conversation:', error);
      // Fallback to demo mode if there's an error
      setDemoMode();
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convoId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convoId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markMessagesAsRead = async () => {
    if (!conversationId || !user) return;
    
    try {
      // Mark all unread messages from coach as read
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('sender_type', 'coach')
        .is('read_at', null);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !message.trim() || !conversationId || !coach) return;

    const messageText = message.trim();
    setMessage('');
    setSendingMessage(true);

    try {
      // Add message to database
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          sender_type: 'client',
          text: messageText,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // No need to add message to state manually as we're subscribed to changes
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback: add message to state if database insert fails
      setMessages(prev => [
        ...prev, 
        {
          id: Date.now().toString(),
          text: messageText,
          sender_id: user.id,
          conversation_id: conversationId || '',
          created_at: new Date().toISOString(),
          read_at: null,
          sender_type: 'client'
        }
      ]);
    } finally {
      setSendingMessage(false);
    }
  };

  // Set demo mode with static data if there's an issue with the database
  const setDemoMode = () => {
    setCoach({
      id: 'demo-coach',
      full_name: 'Sarah Johnson',
      title: 'Personal Fitness Coach',
      avatar_url: 'https://randomuser.me/api/portraits/women/44.jpg',
      last_seen_at: new Date().toISOString()
    });
    
    setConversationId('demo-conversation');
    
    setMessages([
      {
        id: '1',
        text: "Hi! I'm Sarah, your personal fitness coach. How can I help you today?",
        sender_id: 'demo-coach',
        conversation_id: 'demo-conversation',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read_at: new Date().toISOString(),
        sender_type: 'coach'
      }
    ]);
  };

  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), 'h:mm a');
  };

  const isMessageRead = (message: Message) => {
    return message.sender_type === 'client' && message.read_at !== null;
  };

  const getCoachStatus = () => {
    if (!coach?.last_seen_at) return 'Offline';
    
    const lastSeen = new Date(coach.last_seen_at);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
    
    if (diffMinutes < 5) return 'Online';
    if (diffMinutes < 60) return `Last seen ${diffMinutes} min ago`;
    
    return `Last seen ${format(lastSeen, 'h:mm a')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-dark/80"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md bg-dark-surface rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 bg-dark-surface border-b border-primary/20 p-4 flex items-center">
              <button
                onClick={onClose}
                className="text-light/50 hover:text-light transition-colors mr-4"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              {coach && (
                <div className="flex-1">
                  <div className="flex items-center">
                    <h2 className="font-semibold text-light">{coach.full_name}</h2>
                    <div className={`ml-2 w-2 h-2 rounded-full ${
                      getCoachStatus() === 'Online' ? 'bg-green-500' : 'bg-gray-500'
                    }`}></div>
                  </div>
                  <p className="text-xs text-light/50 flex justify-between">
                    <span>{coach.title}</span>
                    <span>{getCoachStatus()}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Messages Container */}
            <div className="h-[500px] overflow-y-auto pt-20 pb-20 px-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] ${
                          msg.sender_type === 'client'
                            ? 'bg-primary text-dark'
                            : 'bg-dark text-light'
                        } rounded-2xl px-4 py-2`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <p className="text-xs opacity-70">
                            {formatMessageTime(msg.created_at)}
                          </p>
                          {msg.sender_type === 'client' && (
                            <span className="text-xs">
                              {isMessageRead(msg) ? (
                                <CheckCheck className="w-3 h-3" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {sendingMessage && (
                    <div className="flex justify-end">
                      <div className="bg-primary/50 text-dark rounded-2xl px-4 py-2">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-dark/50 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-dark/50 rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-dark/50 rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSubmit}
              className="absolute bottom-0 left-0 right-0 bg-dark-surface border-t border-primary/20 p-4"
            >
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 bg-dark border border-primary/20 rounded-full py-2 px-4 text-light placeholder-light/30 focus:outline-none focus:border-primary"
                  placeholder="Type a message..."
                  disabled={loading || sendingMessage}
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
                  disabled={loading || sendingMessage || !message.trim()}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MessageCoachModal;
