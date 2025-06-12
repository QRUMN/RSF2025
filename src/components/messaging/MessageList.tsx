import React from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';

interface MessageListProps {
  conversations: any[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  loading: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  loading
}) => {
  const formatLastMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-primary/10 rounded animate-pulse w-1/2"></div>
                <div className="h-3 bg-primary/10 rounded animate-pulse w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <p className="text-light/50 text-center">No conversations yet.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-primary/10">
      {conversations.map((conversation) => {
        const isActive = activeConversationId === conversation.id;
        const hasUnread = conversation.unreadCount > 0;
        const coach = conversation.coach;
        const latestMessage = conversation.latestMessage;
        
        return (
          <button
            key={conversation.id}
            className={`w-full p-4 text-left transition-colors hover:bg-primary/5 flex items-start space-x-3 ${
              isActive ? 'bg-primary/10' : ''
            }`}
            onClick={() => onSelectConversation(conversation.id)}
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-dark-surface flex items-center justify-center border border-primary/20 overflow-hidden">
                {coach?.avatar_url ? (
                  <img 
                    src={coach.avatar_url} 
                    alt={coach.full_name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-medium text-primary">
                    {coach?.full_name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {hasUnread && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-dark">
                  {conversation.unreadCount}
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className={`font-medium truncate ${hasUnread ? 'text-light' : 'text-light/70'}`}>
                  {coach?.full_name || 'Coach'}
                </h3>
                {latestMessage && (
                  <span className="text-xs text-light/50">
                    {formatLastMessageDate(latestMessage.created_at)}
                  </span>
                )}
              </div>
              
              {latestMessage ? (
                <div className="flex items-center justify-between mt-1">
                  <p className={`text-sm truncate mr-2 ${
                    hasUnread ? 'text-light font-medium' : 'text-light/50'
                  }`}>
                    {latestMessage.sender_type === 'client' && (
                      <span className="text-primary">You: </span>
                    )}
                    {latestMessage.text}
                  </p>
                  
                  {latestMessage.sender_type === 'client' && (
                    <span className="text-light/50 flex-shrink-0">
                      {latestMessage.read_at ? (
                        <CheckCheck className="w-4 h-4" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-light/50 italic">No messages yet</p>
              )}
              
              {coach?.title && (
                <p className="text-xs text-primary/70 mt-1 truncate">{coach.title}</p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
