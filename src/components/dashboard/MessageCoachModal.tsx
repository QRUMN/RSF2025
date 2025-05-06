import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'coach';
  timestamp: Date;
}

interface MessageCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MessageCoachModal: React.FC<MessageCoachModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm Sarah, your personal fitness coach. How can I help you today?",
      sender: 'coach',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollToBottom();
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    setLoading(true);

    // Simulate coach response
    setTimeout(() => {
      const coachResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thanks for your message! I'll review it and get back to you soon.",
        sender: 'coach',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, coachResponse]);
      setLoading(false);
    }, 1000);
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
              <div>
                <h2 className="font-semibold text-light">Coach Sarah</h2>
                <p className="text-xs text-light/50">Personal Fitness Coach</p>
              </div>
            </div>

            {/* Messages Container */}
            <div className="h-[500px] overflow-y-auto pt-20 pb-20 px-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] ${
                        msg.sender === 'user'
                          ? 'bg-primary text-dark'
                          : 'bg-dark text-light'
                      } rounded-2xl px-4 py-2`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {format(msg.timestamp, 'h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-dark text-light rounded-2xl px-4 py-2">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
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
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
                  disabled={loading || !message.trim()}
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