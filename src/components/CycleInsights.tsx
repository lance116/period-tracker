import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Calendar, Heart, Target, Activity } from 'lucide-react';
import { useCycles } from '@/hooks/useCycles';
import { useProfile } from '@/hooks/useProfile';
import { HealthLogger } from './HealthLogger';

export const CycleInsights = () => {
  const { cycles, getAverageCycleLength } = useCycles();
  const { profile } = useProfile();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const averageCycleLength = getAverageCycleLength();

  const calculateAveragePeriodLength = () => {
    if (cycles.length === 0) return profile?.average_period_duration || 5;
    
    const cyclesWithPeriod = cycles.filter(cycle => cycle.period_duration);
    if (cyclesWithPeriod.length === 0) return profile?.average_period_duration || 5;
    
    const sum = cyclesWithPeriod.reduce((acc, cycle) => acc + (cycle.period_duration || 0), 0);
    return Math.round(sum / cyclesWithPeriod.length);
  };

  const averagePeriodLength = calculateAveragePeriodLength();
  const cyclesTracked = cycles.length;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="insights" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Insights</span>
          </TabsTrigger>
          <TabsTrigger value="health-log" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Health Log</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          {/* Overview Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">{averageCycleLength}</span>
          </div>
          <h3 className="font-semibold text-foreground">Average Cycle</h3>
          <p className="text-sm text-muted-foreground">days long</p>
        </Card>

        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <Heart className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">{averagePeriodLength}</span>
          </div>
          <h3 className="font-semibold text-foreground">Period Length</h3>
          <p className="text-sm text-muted-foreground">days average</p>
        </Card>

        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">
              {profile?.is_regular ? '✓' : '?'}
            </span>
          </div>
          <h3 className="font-semibold text-foreground">Regularity</h3>
          <p className="text-sm text-muted-foreground">
            {profile?.is_regular ? 'Regular' : 'Tracking...'}
          </p>
        </Card>

        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">{cyclesTracked}</span>
          </div>
          <h3 className="font-semibold text-foreground">Cycles Tracked</h3>
          <p className="text-sm text-muted-foreground">total logged</p>
        </Card>
      </div>

      {cyclesTracked === 0 && (
        <Card className="p-6 bg-card border border-border">
          <h3 className="font-semibold text-foreground mb-2">Start tracking your cycles</h3>
          <p className="text-muted-foreground">
            Once you start logging your periods and symptoms, you'll see personalized insights here.
          </p>
        </Card>
      )}

      {/* Insights Cards */}
      {cyclesTracked > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-card border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 text-primary mr-2" />
              Cycle Patterns
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium text-foreground">
                  Your cycles are {profile?.is_regular ? 'regular' : 'being tracked'}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  profile?.is_regular 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {profile?.is_regular ? 'Good' : 'Tracking'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium text-foreground">Average cycle: {averageCycleLength} days</span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                  {averageCycleLength >= 21 && averageCycleLength <= 35 ? 'Normal' : 'Variable'}
                </span>
              </div>
              {cyclesTracked > 1 && (
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium text-foreground">
                    Period length: {averagePeriodLength} days
                  </span>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                    {averagePeriodLength >= 3 && averagePeriodLength <= 7 ? 'Normal' : 'Variable'}
                  </span>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-card border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Heart className="w-5 h-5 text-primary mr-2" />
              Tracking Progress
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">Cycles Logged</span>
                  <span className="text-xs text-primary">{cyclesTracked} cycles</span>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (cyclesTracked / 3) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium text-foreground">
                  {cyclesTracked < 3 
                    ? `Log ${3 - cyclesTracked} more cycles for better insights`
                    : 'Great! You have enough data for accurate predictions'
                  }
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Recommendations */}
      <Card className="p-6 bg-card border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Personalized Recommendations
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted border border-border rounded-lg">
            <h4 className="font-medium text-foreground mb-2">📊 Data Collection</h4>
            <p className="text-sm text-muted-foreground">
              {cyclesTracked < 3 
                ? 'Keep logging your periods to get more accurate predictions and insights.'
                : 'Great job tracking! Your data helps provide accurate cycle predictions.'
              }
            </p>
          </div>
          <div className="p-4 bg-muted border border-border rounded-lg">
            <h4 className="font-medium text-foreground mb-2">💧 Daily Logging</h4>
            <p className="text-sm text-muted-foreground">
              Log symptoms, mood, and flow daily for the most comprehensive health insights.
            </p>
          </div>
          <div className="p-4 bg-muted border border-border rounded-lg">
            <h4 className="font-medium text-foreground mb-2">🔔 Predictions</h4>
            <p className="text-sm text-muted-foreground">
              {cyclesTracked > 0 
                ? 'Check your calendar for period and fertile window predictions.'
                : 'Start tracking to enable period and fertility predictions.'
              }
            </p>
          </div>
          <div className="p-4 bg-muted border border-border rounded-lg">
            <h4 className="font-medium text-foreground mb-2">📱 Consistency</h4>
            <p className="text-sm text-muted-foreground">
              Regular tracking helps identify patterns and irregularities in your cycle.
            </p>
          </div>
          </div>
        </Card>
        </TabsContent>

        <TabsContent value="health-log" className="space-y-6">
          <HealthLogger selectedDate={selectedDate} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
