
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
        <Card className="p-4 bg-white border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-black mb-1">
              {currentCycle && currentCycle.currentDay > 0 ? currentCycle.currentDay : '--'}
            </div>
            <div className="text-sm text-gray-600">Current Day</div>
          </div>
        </Card>
        
        <Card className="p-4 bg-white border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-black mb-1">
              {nextPeriod ? nextPeriod.daysUntil : '--'}
            </div>
            <div className="text-sm text-gray-600">Days Until Period</div>
          </div>
        </Card>
        
        <Card className="p-4 bg-white border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-black mb-1">{averageCycleLength}</div>
            <div className="text-sm text-gray-600">Avg Cycle Length</div>
          </div>
        </Card>
        
        <Card className="p-4 bg-white border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-black mb-1">
              {profile?.average_period_duration || 5}
            </div>
            <div className="text-sm text-gray-600">Period Duration</div>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-white shadow-lg border border-gray-200">
        {/* Enhanced Legend */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
              <Droplets className="w-3 h-3 text-white" />
            </div>
            <span className="font-medium text-black">Period (Past)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-300 rounded-full flex items-center justify-center border-2 border-red-600 opacity-70">
              <Droplets className="w-3 h-3 text-white" />
            </div>
            <span className="font-medium text-black">Period (Predicted)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
              <Circle className="w-3 h-3 text-white fill-current" />
            </div>
            <span className="font-medium text-black">Fertile Window</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="font-medium text-black">Ovulation</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full border-2 border-gray-400"></div>
            <span className="font-medium text-black">Regular Day</span>
          </div>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-800">
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
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2">
              <Droplets className="w-5 h-5 text-black" />
              <div>
                <div className="font-semibold text-black">
                  Your period is expected in {nextPeriod.daysUntil} day{nextPeriod.daysUntil !== 1 ? 's' : ''}!
                </div>
                <div className="text-sm text-gray-600">
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
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-black">Log Period for {selectedLogDate?.toLocaleDateString()}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleLogPeriod} className="space-y-4">
            <div>
              <Label htmlFor="duration" className="text-black font-medium">Period Duration (days)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="10"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="mt-1 border-gray-300 focus:border-black"
                required
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsLogDialogOpen(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-black text-white hover:bg-gray-800"
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
