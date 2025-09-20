
import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Circle, Droplets, Sparkles } from 'lucide-react';

interface ScrollableCalendarProps {
  cycles: any[];
  profile: any;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onPeriodEdit: (period: any) => void;
  onPeriodLog?: (date: Date) => void;
  getFuturePeriods: (months: number) => any[];
  getAverageCycleLength: () => number;
}

export const ScrollableCalendar = ({ 
  cycles, 
  profile, 
  selectedDate, 
  onDateSelect, 
  onPeriodEdit,
  onPeriodLog,
  getFuturePeriods,
  getAverageCycleLength
}: ScrollableCalendarProps) => {
  const [months, setMonths] = useState<Date[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate 24 months (12 past, current, 11 future)
    const monthsArray = [];
    const today = new Date();
    
    for (let i = -12; i <= 11; i++) {
      const month = new Date(today.getFullYear(), today.getMonth() + i, 1);
      monthsArray.push(month);
    }
    
    setMonths(monthsArray);
    
    // Scroll to current month after a brief delay
    setTimeout(() => {
      if (scrollRef.current) {
        const currentMonthIndex = 12; // Current month is at index 12
        const monthElement = scrollRef.current.children[currentMonthIndex] as HTMLElement;
        if (monthElement) {
          monthElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 100);
  }, []);

  const isPeriodDay = (date: Date) => {
    for (const cycle of cycles) {
      // Parse the date string as local date to avoid timezone issues
      const [year, month, day] = cycle.start_date.split('-').map(Number);
      const startDate = new Date(year, month - 1, day); // month is 0-indexed
      const periodDuration = cycle.period_duration || profile?.average_period_duration || 5;
      
      // Create a local date for comparison
      const dateToCheck = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      const daysDiff = Math.floor((dateToCheck.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Period starts on the logged date (daysDiff = 0) and continues for the period duration
      if (daysDiff >= 0 && daysDiff < periodDuration) {
        return { isPeriod: true, cycle };
      }
    }
    return { isPeriod: false, cycle: null };
  };

  const isFuturePeriodDay = (date: Date) => {
    const futurePeriods = getFuturePeriods(24);
    const periodDuration = profile?.average_period_duration || 5;
    
    for (const futurePeriod of futurePeriods) {
      const startDate = new Date(futurePeriod.date);
      startDate.setHours(0, 0, 0, 0);
      
      const dateToCheck = new Date(date);
      dateToCheck.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((dateToCheck.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= 0 && daysDiff < periodDuration) {
        return { isPeriod: true, confidence: futurePeriod.confidence };
      }
    }
    return { isPeriod: false, confidence: 0 };
  };

  const isFertileDay = (date: Date, isHistorical: boolean) => {
    if (cycles.length === 0) return false;
    
    const cycleLength = getAverageCycleLength();
    
    // Check historical cycles
    for (const cycle of cycles) {
      const [year, month, day] = cycle.start_date.split('-').map(Number);
      const startDate = new Date(year, month - 1, day);
      const ovulationDay = new Date(startDate);
      ovulationDay.setDate(startDate.getDate() + Math.floor(cycleLength / 2) - 1);
      
      const fertileStart = new Date(ovulationDay);
      fertileStart.setDate(ovulationDay.getDate() - 5);
      const fertileEnd = new Date(ovulationDay);
      fertileEnd.setDate(ovulationDay.getDate() + 1);
      
      if (date >= fertileStart && date <= fertileEnd && !isPeriodDay(date).isPeriod) {
        return true;
      }
    }

    // Check future cycles only if not historical
    if (!isHistorical) {
      const futurePeriods = getFuturePeriods(24);
      for (const futurePeriod of futurePeriods) {
        const startDate = futurePeriod.date;
        const ovulationDay = new Date(startDate);
        ovulationDay.setDate(startDate.getDate() + Math.floor(cycleLength / 2) - 1);
        
        const fertileStart = new Date(ovulationDay);
        fertileStart.setDate(ovulationDay.getDate() - 5);
        const fertileEnd = new Date(ovulationDay);
        fertileEnd.setDate(ovulationDay.getDate() + 1);
        
        if (date >= fertileStart && date <= fertileEnd && !isFuturePeriodDay(date).isPeriod) {
          return true;
        }
      }
    }
    
    return false;
  };

  const isOvulationDay = (date: Date, isHistorical: boolean) => {
    if (cycles.length === 0) return false;
    
    const cycleLength = getAverageCycleLength();
    
    // Check historical cycles
    for (const cycle of cycles) {
      const [year, month, day] = cycle.start_date.split('-').map(Number);
      const startDate = new Date(year, month - 1, day);
      const ovulationDay = new Date(startDate);
      ovulationDay.setDate(startDate.getDate() + Math.floor(cycleLength / 2) - 1);
      
      if (date.toDateString() === ovulationDay.toDateString()) {
        return true;
      }
    }

    // Check future cycles only if not historical
    if (!isHistorical) {
      const futurePeriods = getFuturePeriods(24);
      for (const futurePeriod of futurePeriods) {
        const startDate = futurePeriod.date;
        const ovulationDay = new Date(startDate);
        ovulationDay.setDate(startDate.getDate() + Math.floor(cycleLength / 2) - 1);
        
        if (date.toDateString() === ovulationDay.toDateString()) {
          return true;
        }
      }
    }
    
    return false;
  };

  const renderMonth = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const today = new Date();
    const isHistoricalMonth = monthDate < new Date(today.getFullYear(), today.getMonth(), 1);
    const cycleLength = getAverageCycleLength();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <Card key={`${year}-${month}`} className="p-6 mb-6 bg-white shadow-lg border border-gray-200">
        <h3 className="text-xl font-bold text-black mb-4 text-center">
          {monthNames[month]} {year}
        </h3>

        <div className="grid grid-cols-7 gap-2">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg">
              {day}
            </div>
          ))}

          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="h-12"></div>
          ))}

          {days.map(day => {
            const date = new Date(year, month, day);
            const isToday = date.toDateString() === today.toDateString();
            
            const periodInfo = isPeriodDay(date);
            const futurePeriodInfo = isFuturePeriodDay(date);
            const isFertile = isFertileDay(date, isHistoricalMonth);
            const isOvulation = isOvulationDay(date, isHistoricalMonth);
            
            let cellClasses = [
              'h-12 flex items-center justify-center text-sm cursor-pointer rounded-lg transition-all duration-200 relative font-medium border-2 border-transparent hover:border-border'
            ];

            let bgColor = 'bg-white hover:bg-gray-50 text-black';
            let icon = null;
            const isPastDate = date < today;
            
            if (periodInfo.isPeriod) {
              bgColor = 'bg-red-600 text-white hover:bg-red-700 shadow-lg';
              icon = <Droplets className="w-3 h-3 absolute top-1 right-1" />;
            } else if (futurePeriodInfo.isPeriod) {
              bgColor = 'bg-red-400 text-white hover:bg-red-500 border-red-500 shadow-md opacity-70';
              icon = <Droplets className="w-3 h-3 absolute top-1 right-1" />;
            } else if (isOvulation) {
              // Check if this ovulation is for a logged period cycle
              const isFromLoggedCycle = cycles.some(cycle => {
                const [year, month, day] = cycle.start_date.split('-').map(Number);
                const startDate = new Date(year, month - 1, day);
                const ovulationDay = new Date(startDate);
                ovulationDay.setDate(startDate.getDate() + Math.floor(cycleLength / 2) - 1);
                return date.toDateString() === ovulationDay.toDateString();
              });
              const opacity = !isFromLoggedCycle ? 'opacity-70' : '';
              bgColor = `bg-blue-500 text-white hover:bg-blue-600 shadow-lg ${opacity}`;
              icon = <Sparkles className="w-3 h-3 absolute top-1 right-1" />;
            } else if (isFertile) {
              // Check if this fertile window is for a logged period cycle
              const isFromLoggedCycle = cycles.some(cycle => {
                const [year, month, day] = cycle.start_date.split('-').map(Number);
                const startDate = new Date(year, month - 1, day);
                const ovulationDay = new Date(startDate);
                ovulationDay.setDate(startDate.getDate() + Math.floor(cycleLength / 2) - 1);
                const fertileStart = new Date(ovulationDay);
                fertileStart.setDate(ovulationDay.getDate() - 5);
                const fertileEnd = new Date(ovulationDay);
                fertileEnd.setDate(ovulationDay.getDate() + 1);
                return date >= fertileStart && date <= fertileEnd;
              });
              const opacity = !isFromLoggedCycle ? 'opacity-70' : '';
              bgColor = `bg-green-500 text-white hover:bg-green-600 shadow-md ${opacity}`;
              icon = <Circle className="w-2 h-2 absolute top-1 right-1 fill-current" />;
            }

            cellClasses.push(bgColor);

            if (isToday) {
              cellClasses.push('ring-4 ring-black ring-opacity-50 font-bold scale-105');
            }

            return (
              <div
                key={day}
                className={cellClasses.join(' ')}
                onClick={() => {
                  onDateSelect(date);
                  if (periodInfo.isPeriod && periodInfo.cycle) {
                    onPeriodEdit(periodInfo.cycle);
                  } else if (!periodInfo.isPeriod && isPastDate && onPeriodLog) {
                    // Allow logging periods only for past dates
                    onPeriodLog(date);
                  }
                }}
              >
                {day}
                {icon}
              </div>
            );
          })}
        </div>
      </Card>
    );
  };

  return (
    <div ref={scrollRef} className="max-h-[600px] overflow-y-auto space-y-4 pr-2">
      {months.map(month => renderMonth(month))}
    </div>
  );
};
