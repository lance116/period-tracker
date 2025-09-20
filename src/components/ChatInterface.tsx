import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCycles } from '@/hooks/useCycles';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { cycles, getCurrentCycle, getNextPeriodPrediction } = useCycles();
  const { profile } = useProfile();

  // Load chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(50);

        if (error) throw error;

        if (data && data.length > 0) {
          const loadedMessages = data.map(msg => ({
            id: msg.id,
            content: msg.content,
            isUser: msg.is_user,
            timestamp: new Date(msg.created_at)
          }));
          setMessages(loadedMessages);
        } else {
          // Show welcome message only if no history
          setMessages([{
            id: '1',
            content: "Hi! I'm your Period Tracker assistant. I can help you with questions about menstrual health, cycle tracking, symptoms, fertility, and general wellness. Feel free to ask me anything about your cycle or period-related concerns!",
            isUser: false,
            timestamp: new Date()
          }]);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        // Show welcome message on error
        setMessages([{
          id: '1',
          content: "Hi! I'm your Period Tracker assistant. I can help you with questions about menstrual health, cycle tracking, symptoms, fertility, and general wellness. Feel free to ask me anything about your cycle or period-related concerns!",
          isUser: false,
          timestamp: new Date()
        }]);
      }
    };

    loadChatHistory();
  }, [user]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user) return;

    const messageContent = inputMessage;
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Save user message to database
      await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          content: messageContent,
          is_user: true
        });

      // Prepare user data for context
      const currentCycle = getCurrentCycle();
      const nextPeriod = getNextPeriodPrediction();
      
      // Calculate current phase
      let currentPhase = 'unknown';
      if (currentCycle && profile) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const cycleStart = new Date(currentCycle.start_date);
        cycleStart.setHours(0, 0, 0, 0);
        const dayOfCycle = Math.floor((today.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        if (dayOfCycle <= (profile.average_period_duration || 5)) {
          currentPhase = 'menstrual';
        } else if (dayOfCycle <= 14) {
          currentPhase = 'follicular';
        } else if (dayOfCycle <= 16) {
          currentPhase = 'ovulation';
        } else {
          currentPhase = 'luteal';
        }
      }

      // Fetch recent health logs
      const { data: healthLogs } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('log_date', { ascending: false })
        .limit(7);

      // Get recent chat history for context (last 10 messages)
      const recentMessages = messages.slice(-10).map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      }));

      const userData = {
        cycles: cycles?.slice(-5),
        profile,
        currentPhase,
        nextPeriod: nextPeriod?.date ? new Date(nextPeriod.date).toLocaleDateString() : null,
        healthLogs: healthLogs || [],
        chatHistory: recentMessages
      };

      // Send message with user data
      const { data, error } = await supabase.functions.invoke('chat-with-gemini', {
        body: { 
          message: messageContent,
          userData 
        }
      });

      if (error) throw error;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.reply,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

      // Save bot message to database
      await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          content: data.reply,
          is_user: false
        });

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Chat Error",
        description: "Sorry, I'm having trouble responding right now. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "What are normal period symptoms?",
    "How long should my cycle be?",
    "When am I most fertile?",
    "What causes irregular periods?",
    "How can I track ovulation?",
    "What are PMS symptoms?"
  ];

  return (
    <Card className="h-[600px] bg-white border border-gray-200 shadow-lg">
      <CardHeader className="bg-black text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Chat with AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-full">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!message.isUser && (
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-4 rounded-lg ${
                    message.isUser
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-black'
                  } animate-fade-in`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <span className="text-xs opacity-70 mt-2 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {message.isUser && (
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {messages.length === 1 && (
          <div className="p-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Try asking me about:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-left justify-start h-auto p-2 text-xs border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => setInputMessage(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <div className="p-4 border-t border-gray-200 flex gap-3">
          <input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about periods, cycles, or health..."
            disabled={isLoading}
            className="flex-1 h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-black text-white hover:bg-gray-800"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};