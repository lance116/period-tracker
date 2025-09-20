
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Calendar, TrendingUp, User, Settings, LogOut, MessageCircle } from 'lucide-react';
import { CycleCalendar } from '@/components/CycleCalendar';
import { CycleInsights } from '@/components/CycleInsights';
import { PeriodLogger } from '@/components/PeriodLogger';
import { ChatBot } from '@/components/ChatBot';
import { ChatInterface } from '@/components/ChatInterface';
import { supabase } from '@/integrations/supabase/client';
import { useCycles } from '@/hooks/useCycles';
import { useProfile } from '@/hooks/useProfile';

export const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('calendar');
  const { cycles, getCurrentCycle, getNextPeriodPrediction, getAverageCycleLength } = useCycles();
  const { profile } = useProfile();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const currentCycle = getCurrentCycle();
  const nextPeriod = getNextPeriodPrediction();
  const averageCycleLength = getAverageCycleLength();

  const getCurrentPhase = () => {
    if (!currentCycle || currentCycle.currentDay <= 0) return 'Unknown';
    
    const day = currentCycle.currentDay;
    const periodDuration = profile?.average_period_duration || 5;
    
    if (day <= periodDuration) return 'Menstrual';
    if (day <= averageCycleLength * 0.5) return 'Follicular';
    if (day <= averageCycleLength * 0.6) return 'Ovulation';
    return 'Luteal';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-2xl font-bold text-black">
              Perica
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-gray-600 hover:text-black">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
            <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <Card className="p-6 mb-8 bg-gray-50 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-black mb-2">Good morning! 👋</h1>
              <p className="text-gray-600">
                {currentCycle && currentCycle.currentDay > 0 ? (
                  <>
                    You're in your {getCurrentPhase().toLowerCase()} phase. 
                    {nextPeriod && ` Your next period is predicted in ${nextPeriod.daysUntil} days.`}
                  </>
                ) : (
                  'Welcome to your period tracking dashboard.'
                )}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-black">
                {currentCycle && currentCycle.currentDay > 0 ? `Day ${currentCycle.currentDay}` : '--'}
              </div>
              <p className="text-sm text-gray-600">of your cycle</p>
            </div>
          </div>
        </Card>

        {cycles.length === 0 && (
          <Card className="p-6 mb-8 bg-yellow-50 border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-2">Ready to start tracking?</h3>
            <p className="text-yellow-700">
              Click on any past date in the calendar to record your period and begin tracking your cycle.
            </p>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger value="calendar" className="flex items-center space-x-2 text-gray-600 data-[state=active]:text-black data-[state=active]:bg-white">
              <Calendar className="w-4 h-4" />
              <span>Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center space-x-2 text-gray-600 data-[state=active]:text-black data-[state=active]:bg-white">
              <TrendingUp className="w-4 h-4" />
              <span>Insights</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center space-x-2 text-gray-600 data-[state=active]:text-black data-[state=active]:bg-white">
              <MessageCircle className="w-4 h-4" />
              <span>AI Chat</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <CycleCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
          </TabsContent>

          <TabsContent value="insights">
            <CycleInsights />
          </TabsContent>

          <TabsContent value="chat">
            <ChatInterface />
          </TabsContent>
        </Tabs>
      </div>
      {/* Only show ChatBot when not on chat tab */}
      {activeTab !== 'chat' && <ChatBot />}
    </div>
  );
};
