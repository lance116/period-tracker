
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PeriodEditorProps {
  isOpen: boolean;
  onClose: () => void;
  period: {
    id: string;
    start_date: string;
    period_duration: number;
  } | null;
  onUpdate: () => void;
}

export const PeriodEditor = ({ isOpen, onClose, period, onUpdate }: PeriodEditorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('5');

  // Get today's date in YYYY-MM-DD format for max date validation
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (period) {
      setStartDate(period.start_date);
      setDuration(period.period_duration?.toString() || '5');
    }
  }, [period]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !period) return;

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
      const { error } = await supabase
        .from('cycles')
        .update({
          start_date: startDate,
          period_duration: parseInt(duration)
        })
        .eq('id', period.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating period:', error);
        
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
            description: "Failed to update period. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Success",
        description: "Period updated successfully!",
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating period:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !period) return;

    if (!confirm('Are you sure you want to delete this period entry?')) {
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('cycles')
        .delete()
        .eq('id', period.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting period:', error);
        toast({
          title: "Error",
          description: "Failed to delete period. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Period deleted successfully!",
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error deleting period:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!period) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pink-500" />
            Edit Period
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <Label htmlFor="editStartDate">Period Start Date</Label>
            <Input
              id="editStartDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={today}
              className="mt-1"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              You can only set periods to today or earlier
            </p>
          </div>

          <div>
            <Label htmlFor="editDuration">Period Duration (days)</Label>
            <Input
              id="editDuration"
              type="number"
              min="1"
              max="10"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
            
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                disabled={isLoading || !startDate}
              >
                {isLoading ? 'Updating...' : 'Update Period'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
