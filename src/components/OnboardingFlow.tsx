
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Heart, Calendar, User } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form data
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [averageCycleLength, setAverageCycleLength] = useState('28');
  const [periodDuration, setPeriodDuration] = useState('5');
  const [isRegular, setIsRegular] = useState('true');

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      console.log('Starting onboarding completion for user:', user.id);
      
      // Update profile with all the collected data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          date_of_birth: dateOfBirth,
          average_cycle_length: parseInt(averageCycleLength),
          average_period_duration: parseInt(periodDuration),
          is_regular: isRegular === 'true',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      // Add the most recent period to cycles table
      if (lastPeriodDate) {
        const { error: cycleError } = await supabase
          .from('cycles')
          .insert({
            user_id: user.id,
            start_date: lastPeriodDate,
            period_duration: parseInt(periodDuration)
          });

        if (cycleError) {
          console.error('Cycle insert error:', cycleError);
          throw cycleError;
        }
      }

      console.log('Onboarding completed successfully');
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="w-12 h-12 mx-auto mb-4 text-pink-500" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
              <p className="text-gray-600">Let's start with some basic information</p>
            </div>
            
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label>Are your periods generally regular?</Label>
              <RadioGroup value={isRegular} onValueChange={setIsRegular} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="regular-yes" />
                  <Label htmlFor="regular-yes">Yes, they come around the same time each month</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="regular-no" />
                  <Label htmlFor="regular-no">No, they vary quite a bit</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-pink-500" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Period History</h2>
              <p className="text-gray-600">Tell us about your typical cycle</p>
            </div>
            
            <div>
              <Label htmlFor="lastPeriod">When did your last period start?</Label>
              <Input
                id="lastPeriod"
                type="date"
                value={lastPeriodDate}
                onChange={(e) => setLastPeriodDate(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="cycleLength">Average cycle length (days)</Label>
              <Input
                id="cycleLength"
                type="number"
                min="21"
                max="35"
                value={averageCycleLength}
                onChange={(e) => setAverageCycleLength(e.target.value)}
                className="mt-1"
                required
              />
              <p className="text-sm text-gray-500 mt-1">Typical range is 21-35 days</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 text-pink-500" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Period Duration</h2>
              <p className="text-gray-600">How many days does your period typically last?</p>
            </div>
            
            <div>
              <Label htmlFor="duration">Typical Period Duration (days)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="10"
                value={periodDuration}
                onChange={(e) => setPeriodDuration(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div className="bg-pink-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Birth Date: {dateOfBirth}</li>
                <li>• Regular Cycles: {isRegular === 'true' ? 'Yes' : 'No'}</li>
                <li>• Last Period: {lastPeriodDate}</li>
                <li>• Average Cycle Length: {averageCycleLength} days</li>
                <li>• Period Duration: {periodDuration} days</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500">Step {step} of 3</span>
            <div className="flex space-x-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i <= step ? 'bg-pink-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {renderStep()}

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isLoading}
            >
              Previous
            </Button>
          )}
          
          <div className="ml-auto">
            {step < 3 ? (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                disabled={
                  (step === 1 && !dateOfBirth) ||
                  (step === 2 && (!lastPeriodDate || !averageCycleLength))
                }
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                disabled={isLoading || !periodDuration}
              >
                {isLoading ? 'Setting up...' : 'Complete Setup'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
