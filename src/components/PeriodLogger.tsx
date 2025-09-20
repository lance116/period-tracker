
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Heart, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const PeriodLogger = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('5');

  // Get today's date in YYYY-MM-DD format for max date validation
  const today = new Date().toISOString().split('T')[0];

  const handleLogPeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !startDate) return;

    // Client-side validation to prevent future dates
    if (startDate > today) {
      toast({
        title: "Invalid Date",
        description: "Period start date cannot be in the future.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Logging new period for user:', user.id);
      
      const { error } = await supabase
        .from('cycles')
        .insert({
          user_id: user.id,
          start_date: startDate,
          period_duration: parseInt(duration)
        });

      if (error) {
        console.error('Error logging period:', error);
        
        // Handle the validation error from the database trigger
        if (error.message.includes('Period start date cannot be in the future')) {
          toast({
            title: "Invalid Date",
            description: "Period start date cannot be in the future.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to log period. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      console.log('Period logged successfully');
      toast({
        title: "Success",
        description: "Period logged successfully!",
      });
      
      setIsOpen(false);
      setStartDate('');
      setDuration('5');
      
      // Optionally refresh the page or trigger a re-fetch of cycles
      window.location.reload();
    } catch (error) {
      console.error('Error logging period:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-black text-white hover:bg-gray-800">
          <Plus className="w-4 h-4 mr-2" />
          Log Your Period
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-black">
            <Heart className="w-5 h-5 text-black" />
            Log New Period
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleLogPeriod} className="space-y-4">
          <div>
            <Label htmlFor="startDate" className="text-black font-medium">Period Start Date</Label>
            <div className="relative mt-1">
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={today}
                className="w-full cursor-pointer border-gray-300 focus:border-black"
                required
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              You can only log periods from today or earlier
            </p>
          </div>

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
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-black text-white hover:bg-gray-800"
              disabled={isLoading || !startDate}
            >
              {isLoading ? 'Logging...' : 'Log Period'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
