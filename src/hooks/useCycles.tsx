
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Cycle {
  id: string;
  start_date: string;
  end_date?: string;
  cycle_length?: number;
  period_duration?: number;
}

export const useCycles = () => {
  const { user } = useAuth();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCycles([]);
      setLoading(false);
      return;
    }

    const fetchCycles = async () => {
      try {
        const { data, error } = await supabase
          .from('cycles')
          .select('*')
          .eq('user_id', user.id)
          .order('start_date', { ascending: false });

        if (error) {
          console.error('Error fetching cycles:', error);
          return;
        }

        console.log('Fetched cycles:', data);
        setCycles(data || []);
      } catch (error) {
        console.error('Error fetching cycles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCycles();
  }, [user]);

  const calculateCycleLengths = () => {
    if (cycles.length < 2) return [];
    
    const cycleLengths = [];
    for (let i = 0; i < cycles.length - 1; i++) {
      const currentCycle = cycles[i];
      const nextCycle = cycles[i + 1];
      
      const currentDate = new Date(currentCycle.start_date);
      const nextDate = new Date(nextCycle.start_date);
      
      const daysDiff = Math.abs(Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24)));
      cycleLengths.push(daysDiff);
    }
    
    return cycleLengths;
  };

  const getCurrentCycle = () => {
    if (cycles.length === 0) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    
    // Filter out any future cycles (shouldn't exist due to validation, but just in case)
    const pastAndCurrentCycles = cycles.filter(cycle => {
      const cycleDate = new Date(cycle.start_date);
      cycleDate.setHours(0, 0, 0, 0);
      return cycleDate <= today;
    });

    if (pastAndCurrentCycles.length === 0) return null;
    
    const latestCycle = pastAndCurrentCycles[0]; // Already sorted by start_date desc
    const startDate = new Date(latestCycle.start_date);
    startDate.setHours(0, 0, 0, 0);
    
    // Calculate days since period started
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      ...latestCycle,
      currentDay: Math.max(1, daysSinceStart + 1)
    };
  };

  const getAverageCycleLength = () => {
    const cycleLengths = calculateCycleLengths();
    if (cycleLengths.length === 0) return 28; // Default
    
    const average = cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length;
    return Math.round(average);
  };

  // Calculate standard deviation for more accurate predictions
  const getCycleVariability = () => {
    const cycleLengths = calculateCycleLengths();
    if (cycleLengths.length < 2) return 0;
    
    const average = cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length;
    const variance = cycleLengths.reduce((sum, length) => sum + Math.pow(length - average, 2), 0) / cycleLengths.length;
    return Math.sqrt(variance);
  };

  // Generate future period predictions using statistical analysis
  const getFuturePeriods = (monthsAhead = 12) => {
    // Filter out any future cycles (shouldn't exist due to validation)
    const pastAndCurrentCycles = cycles.filter(cycle => {
      const cycleDate = new Date(cycle.start_date);
      const today = new Date();
      return cycleDate <= today;
    });

    if (pastAndCurrentCycles.length === 0) return [];
    
    const averageCycleLength = getAverageCycleLength();
    const variability = getCycleVariability();
    const latestCycle = pastAndCurrentCycles[0];
    const startDate = new Date(latestCycle.start_date);
    
    const futurePeriods = [];
    let currentPredictionDate = new Date(startDate);
    
    // Generate predictions for the specified number of months
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + monthsAhead);
    
    let cycleCount = 1;
    while (currentPredictionDate <= endDate) {
      // Add slight randomization based on historical variability for more realistic predictions
      const adjustedCycleLength = averageCycleLength + (Math.random() - 0.5) * variability * 0.5;
      currentPredictionDate = new Date(currentPredictionDate.getTime() + Math.round(adjustedCycleLength) * 24 * 60 * 60 * 1000);
      
      if (currentPredictionDate <= endDate) {
        futurePeriods.push({
          date: new Date(currentPredictionDate),
          cycleNumber: cycleCount,
          confidence: Math.max(0.5, 1 - (cycleCount * 0.05)) // Confidence decreases over time
        });
        cycleCount++;
      }
    }
    
    return futurePeriods;
  };

  const getNextPeriodPrediction = () => {
    const futurePeriods = getFuturePeriods(1);
    if (futurePeriods.length === 0) return null;
    
    const nextPeriod = futurePeriods[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    nextPeriod.date.setHours(0, 0, 0, 0); // Reset time to start of day
    
    const daysUntilNext = Math.ceil((nextPeriod.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      daysUntil: Math.max(0, daysUntilNext),
      date: nextPeriod.date,
      confidence: nextPeriod.confidence
    };
  };

  return {
    cycles,
    loading,
    getCurrentCycle,
    getNextPeriodPrediction,
    getAverageCycleLength,
    getFuturePeriods,
    getCycleVariability
  };
};
