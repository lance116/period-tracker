
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Circle, Droplets, Sparkles } from 'lucide-react';
import { useCycles } from '@/hooks/useCycles';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ScrollableCalendar } from '@/components/ScrollableCalendar';
import { PeriodEditor } from '@/components/PeriodEditor';

interface CycleCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const CycleCalendar = ({ selectedDate, onDateSelect }: CycleCalendarProps) => {
  const { cycles, getCurrentCycle, getNextPeriodPrediction, getAverageCycleLength, getFuturePeriods } = useCycles();
  const { profile } = useProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingPeriod, setEditingPeriod] = useState<any>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [selectedLogDate, setSelectedLogDate] = useState<Date | null>(null);
  const [duration, setDuration] = useState('5');

  const currentCycle = getCurrentCycle();
  const nextPeriod = getNextPeriodPrediction();
  const averageCycleLength = getAverageCycleLength();

  const handlePeriodEdit = (period: any) => {
    setEditingPeriod(period);
    setIsEditorOpen(true);
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setEditingPeriod(null);
  };

  const handlePeriodUpdate = () => {
    // Trigger a refresh of the data
    window.location.reload();
  };

  const handlePeriodLog = (date: Date) => {
    setSelectedLogDate(date);
    setIsLogDialogOpen(true);
  };

  const handleLogPeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedLogDate) return;

    try {
      // Format date as YYYY-MM-DD in local timezone
      const year = selectedLogDate.getFullYear();
      const month = String(selectedLogDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedLogDate.getDate()).padStart(2, '0');
      const localDateString = `${year}-${month}-${day}`;

      const { error } = await supabase
        .from('cycles')
        .insert({
          user_id: user.id,
          start_date: localDateString,
          period_duration: parseInt(duration)
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Period logged successfully!",
      });
      
      setIsLogDialogOpen(false);
      setDuration('5');
      window.location.reload();
    } catch (error) {
      console.error('Error logging period:', error);
      toast({
        title: "Error",
        description: "Failed to log period. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-pink-500/20 to-pink-600/20 border border-pink-500/30">
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-400 mb-1">
              {currentCycle && currentCycle.currentDay > 0 ? currentCycle.currentDay : '--'}
            </div>
            <div className="text-sm text-pink-300">Current Day</div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {nextPeriod ? nextPeriod.daysUntil : '--'}
            </div>
            <div className="text-sm text-purple-300">Days Until Period</div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">{averageCycleLength}</div>
            <div className="text-sm text-blue-300">Avg Cycle Length</div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {profile?.average_period_duration || 5}
            </div>
            <div className="text-sm text-green-300">Period Duration</div>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-card shadow-lg border border-border">
        {/* Enhanced Legend */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <Droplets className="w-3 h-3 text-white" />
            </div>
            <span className="font-medium">Period (Past)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-red-300 to-red-400 rounded-full flex items-center justify-center border-2 border-red-500 opacity-70">
              <Droplets className="w-3 h-3 text-white" />
            </div>
            <span className="font-medium">Period (Predicted)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
              <Circle className="w-3 h-3 text-white fill-current" />
            </div>
            <span className="font-medium">Fertile Window</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="font-medium">Ovulation</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-muted rounded-full border-2 border-border"></div>
            <span className="font-medium">Regular Day</span>
          </div>
        </div>

        <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <div className="text-sm text-blue-300">
            <strong>Tip:</strong> Click on any period day to edit or delete it. Future predictions are shown with reduced opacity.
          </div>
        </div>

        {/* Scrollable Calendar */}
        <ScrollableCalendar
          cycles={cycles}
          profile={profile}
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          onPeriodEdit={handlePeriodEdit}
          onPeriodLog={handlePeriodLog}
          getFuturePeriods={getFuturePeriods}
          getAverageCycleLength={getAverageCycleLength}
        />

        {/* Next Period Alert */}
        {nextPeriod && nextPeriod.daysUntil <= 7 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
            <div className="flex items-center space-x-2">
              <Droplets className="w-5 h-5 text-purple-400" />
              <div>
                <div className="font-semibold text-purple-300">
                  Your period is expected in {nextPeriod.daysUntil} day{nextPeriod.daysUntil !== 1 ? 's' : ''}!
                </div>
                <div className="text-sm text-purple-400">
                  Expected date: {nextPeriod.date.toLocaleDateString()} 
                  {nextPeriod.confidence && (
                    <span className="ml-2">
                      (Confidence: {Math.round(nextPeriod.confidence * 100)}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Period Editor Dialog */}
      <PeriodEditor
        isOpen={isEditorOpen}
        onClose={handleEditorClose}
        period={editingPeriod}
        onUpdate={handlePeriodUpdate}
      />

      {/* Quick Period Log Dialog */}
      <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Period for {selectedLogDate?.toLocaleDateString()}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleLogPeriod} className="space-y-4">
            <div>
              <Label htmlFor="duration">Period Duration (days)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="10"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsLogDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                Log Period
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
