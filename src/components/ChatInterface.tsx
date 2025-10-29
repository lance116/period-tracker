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
import { Textarea } from '@/components/ui/textarea';

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
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { cycles, getCurrentCycle, getNextPeriodPrediction } = useCycles();
  const { profile } = useProfile();

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      if (!user || historyLoaded) return;

      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(50);

        if (error) throw error;

        if (data && data.length > 0) {
          setMessages(data.map(msg => ({
            id: msg.id,
            content: msg.content,
            isUser: msg.is_user,
            timestamp: new Date(msg.created_at)
          })));
        } else {
          // Show welcome message if no history
          setMessages([{
            id: '1',
            content: "Hi! I'm Perica, your period tracking assistant. I can help you with questions about menstrual health, cycle tracking, symptoms, fertility, and general wellness. I can see your cycle data and health logs to give you personalized advice. How can I help you today?",
            isUser: false,
            timestamp: new Date()
          }]);
        }
        setHistoryLoaded(true);
      } catch (error) {
        console.error('Error loading history:', error);
        // Show welcome on error
        setMessages([{
          id: '1',
          content: "Hi! I'm Perica, your period tracking assistant. I can help you with questions about menstrual health, cycle tracking, symptoms, fertility, and general wellness. I can see your cycle data and health logs to give you personalized advice. How can I help you today?",
          isUser: false,
          timestamp: new Date()
        }]);
        setHistoryLoaded(true);
      }
    };

    loadHistory();
  }, [user, historyLoaded]);

  // Auto-scroll to bottom when messages change or history loads
  useEffect(() => {
    if (scrollAreaRef.current && historyLoaded) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }, 100);
    }
  }, [messages, historyLoaded]);

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
      console.log('Sending message to chat function...');

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

      // Get recent chat history for context (last 5 messages only, excluding the current one)
      const recentMessages = messages.slice(-5).map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      }));

      const userData = {
        cycles: cycles?.slice(-5) || [],
        profile: profile || null,
        currentPhase,
        nextPeriod: nextPeriod?.date ? new Date(nextPeriod.date).toLocaleDateString() : null,
        healthLogs: healthLogs || [],
        chatHistory: recentMessages
      };

      console.log('Calling chat function with userData:', {
        hasCycles: !!userData.cycles.length,
        hasProfile: !!userData.profile,
        currentPhase: userData.currentPhase,
        nextPeriod: userData.nextPeriod,
        healthLogsCount: userData.healthLogs.length
      });

      // Get current session to ensure auth header is sent
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        throw new Error('No active session. Please log out and log back in.');
      }

      console.log('Session found, calling function...');

      // Send message with user data
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          message: messageContent,
          userData
        },
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`
        }
      });

      console.log('Chat function response:', { data, error });

      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      if (!data || !data.reply) {
        throw new Error('No reply from function');
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.reply,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      console.log('Message successfully added');

      // Save both messages to database
      try {
        await supabase.from('chat_messages').insert([
          {
            user_id: user.id,
            content: messageContent,
            is_user: true
          },
          {
            user_id: user.id,
            content: data.reply,
            is_user: false
          }
        ]);
        console.log('Messages saved to database');
      } catch (saveError) {
        console.error('Error saving to database:', saveError);
        // Don't throw - the chat still works, just history won't persist
      }

    } catch (error: any) {
      console.error('Chat error details:', {
        error,
        message: error?.message,
        status: error?.status,
        details: error?.details
      });

      toast({
        title: "Chat Error",
        description: error?.message || "Sorry, I'm having trouble responding right now. Please try again.",
        variant: "destructive"
      });

      // Remove the user message if there was an error
      setMessages(prev => prev.slice(0, -1));
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
    <div className="h-full w-full">
      <Card className="h-[calc(100vh-180px)] flex flex-col border-0 shadow-none">
        <CardHeader className="border-b bg-gradient-to-r from-pink-50 to-purple-50 flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Bot className="w-6 h-6 text-purple-600" />
            Chat with Perica
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <ScrollArea className="flex-1 h-full p-6" ref={scrollAreaRef}>
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!message.isUser && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] p-4 rounded-2xl ${
                      message.isUser
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    } animate-fade-in`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.isUser && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-gray-100 p-4 rounded-2xl">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              {messages.length === 1 && !isLoading && historyLoaded && (
                <div className="mt-8">
                  <p className="text-sm text-gray-600 mb-3">Suggested questions:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="text-left justify-start h-auto py-3 px-4 hover:bg-purple-50 hover:border-purple-300"
                        onClick={() => {
                          setInputMessage(question);
                        }}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t p-4 bg-white flex-shrink-0">
            <div className="max-w-3xl mx-auto flex gap-2">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your period, cycle, or symptoms..."
                disabled={isLoading}
                className="flex-1 min-h-[50px] max-h-[150px] resize-none"
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="icon"
                className="h-[50px] w-[50px] bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 flex-shrink-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
