import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Send, Check, CheckCheck, PaperclipIcon, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Message {
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

interface Participant {
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

interface ConversationViewProps {
  conversationId: string;
  refreshConversations: () => void;
  isUserClient: boolean; // true for client, false for coach/admin
}

export const ConversationView: React.FC<ConversationViewProps> = ({ 
  conversationId,
  refreshConversations,
  isUserClient
}) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch messages and conversation details
  useEffect(() => {
    if (conversationId && user) {
      fetchMessages();
      fetchParticipantDetails();
      const unsubscribe = subscribeToMessages();
      markMessagesAsRead();
      
      return unsubscribe;
    }
  }, [conversationId, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipantDetails = async () => {
    try {
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .select('client_id, coach_id')
        .eq('id', conversationId)
        .single();
      
      if (conversationError) throw conversationError;
      
      // If user is client, fetch coach details, otherwise fetch client details
      const participantId = isUserClient ? conversationData.coach_id : conversationData.client_id;
      
      if (isUserClient) {
        // Fetch coach details
        const { data, error } = await supabase
          .from('coaches')
          .select('id, full_name, avatar_url, title, last_seen_at')
          .eq('id', participantId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setParticipant({
            id: data.id,
            full_name: data.full_name,
            title: data.title,
            avatar_url: data.avatar_url,
            last_seen_at: data.last_seen_at
          });
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
          // Access the joined data correctly
          setParticipant({
            id: data.id,
            full_name: typeof data.users === 'object' && data.users ? 
              (data.users as any).full_name || 'Client' : 'Client',
            avatar_url: typeof data.users === 'object' && data.users ? 
              (data.users as any).avatar_url : null
          });
        }
      }
    } catch (error) {
      console.error('Error fetching participant details:', error);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('conversation-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        const newMessage = payload.new as Message;
        setMessages(prev => [...prev, newMessage]);
        
        // If message is from the other party, mark it as read
        if ((isUserClient && newMessage.sender_type === 'coach') ||
            (!isUserClient && newMessage.sender_type === 'client')) {
          markMessagesAsRead();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markMessagesAsRead = async () => {
    try {
      // Mark messages from the other party as read
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('sender_type', isUserClient ? 'coach' : 'client')
        .is('read_at', null);
      
      if (error) throw error;
      
      // Update local messages state to reflect read status
      setMessages(prev => 
        prev.map(msg => 
          (isUserClient && msg.sender_type === 'coach' && !msg.read_at) ||
          (!isUserClient && msg.sender_type === 'client' && !msg.read_at)
            ? { ...msg, read_at: new Date().toISOString() }
            : msg
        )
      );
      
      // Refresh conversation list to update unread counts
      refreshConversations();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachment(e.target.files[0]);
    }
  };

  interface AttachmentData {
    url: string;
    filename: string;
  }

  const uploadAttachment = async (file: File): Promise<AttachmentData | null> => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!message.trim() && !attachment) || !conversationId) return;

    const messageText = message.trim();
    setMessage('');
    setSendingMessage(true);
    
    try {
      let attachmentData = null;
      
      // Upload attachment if present
      if (attachment) {
        attachmentData = await uploadAttachment(attachment);
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
      
      // Add message to database
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          sender_type: isUserClient ? 'client' : 'coach',
          text: messageText,
          created_at: new Date().toISOString(),
          attachment_url: attachmentData?.url || null,
          attachment_name: attachmentData?.filename || null
        });
      
      if (error) throw error;
      
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), 'h:mm a');
  };

  const isMessageRead = (message: Message) => {
    return message.read_at !== null;
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getParticipantStatus = () => {
    if (!participant?.last_seen_at) return 'Offline';
    
    const lastSeen = new Date(participant.last_seen_at);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
    
    if (diffMinutes < 5) return 'Online';
    if (diffMinutes < 60) return `Last seen ${diffMinutes} min ago`;
    
    return `Last seen ${format(lastSeen, 'h:mm a')}`;
  };

  return (
    <>
      {/* Header */}
      <div className="bg-dark-surface border-b border-primary/20 p-4 flex items-center">
        {participant && (
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-dark-surface flex items-center justify-center border border-primary/20 overflow-hidden mr-3">
              {participant.avatar_url ? (
                <img 
                  src={participant.avatar_url} 
                  alt={participant.full_name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-medium text-primary">
                  {participant.full_name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center">
                <h2 className="font-semibold text-light">{participant.full_name}</h2>
                {isUserClient && participant.last_seen_at && (
                  <div className={`ml-2 w-2 h-2 rounded-full ${
                    getParticipantStatus() === 'Online' ? 'bg-green-500' : 'bg-gray-500'
                  }`}></div>
                )}
              </div>
              {isUserClient && participant.title && (
                <p className="text-xs text-light/50 flex justify-between">
                  <span>{participant.title}</span>
                  {participant.last_seen_at && (
                    <span>{getParticipantStatus()}</span>
                  )}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="text-light/50">
              <p className="mb-2">No messages yet</p>
              <p className="text-sm">Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isOwnMessage = (isUserClient && msg.sender_type === 'client') || 
                                (!isUserClient && msg.sender_type === 'coach');
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] ${
                      isOwnMessage
                        ? 'bg-primary text-dark'
                        : 'bg-dark text-light'
                    } rounded-2xl px-4 py-2`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    
                    {/* Attachment if present */}
                    {msg.attachment_url && (
                      <div className="mt-2 p-2 bg-dark/10 rounded-lg">
                        <a 
                          href={msg.attachment_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs flex items-center hover:underline"
                        >
                          <PaperclipIcon className="w-3 h-3 mr-1" />
                          {msg.attachment_name || 'Attachment'}
                        </a>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <p className="text-xs opacity-70">
                        {formatMessageTime(msg.created_at)}
                      </p>
                      {isOwnMessage && (
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
              );
            })}
            
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
        className="bg-dark-surface border-t border-primary/20 p-4"
      >
        {/* Attachment preview */}
        {attachment && (
          <div className="mb-2 p-2 bg-dark rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <PaperclipIcon className="w-4 h-4 mr-2 text-primary" />
              <span className="text-sm text-light/70 truncate max-w-[200px]">
                {attachment.name}
              </span>
            </div>
            <button
              type="button"
              onClick={removeAttachment}
              className="text-red-400 hover:text-red-500 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            disabled={loading || sendingMessage}
          />
          
          {/* Attachment button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-light/50 hover:text-light transition-colors"
            disabled={loading || sendingMessage}
          >
            <PaperclipIcon className="w-6 h-6" />
          </button>
          
          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 bg-dark border border-primary/20 rounded-full py-2 px-4 text-light placeholder-light/30 focus:outline-none focus:border-primary"
            placeholder="Type a message..."
            disabled={loading || sendingMessage}
          />
          
          {/* Send button */}
          <Button
            type="submit"
            variant="primary"
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
            disabled={loading || sendingMessage || (!message.trim() && !attachment)}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </>
  );
};
