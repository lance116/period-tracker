import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Brain, 
  Thermometer, 
  Droplets, 
  Moon, 
  Utensils, 
  Activity, 
  Zap,
  Smile,
  Frown,
  Meh,
  Save,
  Plus,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface HealthLoggerProps {
  selectedDate: Date;
}

export const HealthLogger = ({ selectedDate }: HealthLoggerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Basic tracking
  const [flow, setFlow] = useState<string>('');
  const [painLevel, setPainLevel] = useState<number[]>([0]);
  const [mood, setMood] = useState<string>('');
  const [sleep, setSleep] = useState<number[]>([0]);
  const [notes, setNotes] = useState<string>('');
  
  // Advanced health tracking
  const [temperature, setTemperature] = useState<string>('');
  const [energy, setEnergy] = useState<number[]>([0]);
  const [appetite, setAppetite] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [exercise, setExercise] = useState<string>('');
  const [water, setWater] = useState<number[]>([0]);

  const flowOptions = [
    { value: 'none', label: 'None', icon: '' },
    { value: 'spotting', label: 'Spotting', icon: '🔸' },
    { value: 'light', label: 'Light', icon: '🟡' },
    { value: 'medium', label: 'Medium', icon: '🟠' },
    { value: 'heavy', label: 'Heavy', icon: '🔴' }
  ];

  const moodOptions = [
    { value: 'happy', label: 'Happy', icon: Smile },
    { value: 'neutral', label: 'Neutral', icon: Meh },
    { value: 'sad', label: 'Sad', icon: Frown },
    { value: 'anxious', label: 'Anxious', icon: Brain },
    { value: 'irritated', label: 'Irritated', icon: Zap }
  ];

  const appetiteOptions = [
    { value: 'low', label: 'Low', icon: '🥄' },
    { value: 'normal', label: 'Normal', icon: '🍽️' },
    { value: 'high', label: 'High', icon: '🍴' },
    { value: 'cravings', label: 'Cravings', icon: '🍫' }
  ];

  const exerciseOptions = [
    { value: 'none', label: 'None' },
    { value: 'light', label: 'Light' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'intense', label: 'Intense' }
  ];

  const commonSymptoms = [
    'Cramps', 'Bloating', 'Headache', 'Breast tenderness', 'Acne', 
    'Fatigue', 'Mood swings', 'Food cravings', 'Back pain', 'Nausea',
    'Diarrhea', 'Constipation', 'Hot flashes', 'Cold sweats', 'Insomnia'
  ];

  useEffect(() => {
    loadExistingLog();
  }, [selectedDate, user]);

  const loadExistingLog = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', selectedDate.toISOString().split('T')[0])
      .single();

    if (data) {
      setFlow(data.flow || '');
      setPainLevel([data.pain_level || 0]);
      setMood(data.mood || '');
      setSleep([data.sleep_hours || 8]);
      
      // Parse health data from notes field and extract the actual notes text
      try {
        const healthData = JSON.parse(data.notes || '{}');
        if (healthData.temperature) setTemperature(healthData.temperature);
        if (healthData.energy) setEnergy([healthData.energy]);
        if (healthData.appetite) setAppetite(healthData.appetite);
        if (healthData.symptoms) setSymptoms(healthData.symptoms);
        if (healthData.exercise) setExercise(healthData.exercise);
        if (healthData.water) setWater([healthData.water]);
        if (healthData.notes) setNotes(healthData.notes);
      } catch {
        // If notes is just text, use it directly
        setNotes(data.notes || '');
      }
    } else {
      // Reset form when no data found
      resetForm();
    }
  };

  const resetForm = () => {
    setFlow('');
    setPainLevel([0]);
    setMood('');
    setSleep([0]);
    setNotes('');
    setTemperature('');
    setEnergy([0]);
    setAppetite('');
    setSymptoms([]);
    setExercise('');
    setWater([0]);
  };

  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSave = async () => {
    if (!user) return;

    const healthData = {
      temperature: temperature ? parseFloat(temperature) : null,
      energy: energy[0],
      appetite: appetite || null,
      symptoms,
      exercise: exercise || null,
      water: water[0],
      notes: notes
    };

    const logData = {
      user_id: user.id,
      log_date: selectedDate.toISOString().split('T')[0],
      flow: flow || null,
      pain_level: painLevel[0],
      mood: mood || null,
      sleep_hours: sleep[0],
      notes: JSON.stringify({ ...healthData, notes })
    };

    const { error } = await supabase
      .from('daily_logs')
      .upsert(logData, { 
        onConflict: 'user_id,log_date',
        ignoreDuplicates: false 
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save your health log",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Health log saved successfully"
      });
      resetForm();
    }
  };

  return (
    <div className="space-y-6">
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #000;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #000;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
      <Card className="p-6 bg-white border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-black">Health Log</h3>
            <p className="text-sm text-gray-600">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800">
            <Save className="w-4 h-4 mr-2" />
            Save Log
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Period Flow */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Droplets className="w-5 h-5 text-black" />
              <h4 className="font-medium text-black">Period Flow</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {flowOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFlow(option.value)}
                  className={`w-full justify-start h-auto p-3 rounded-md border transition-colors ${
                    flow === option.value 
                      ? 'bg-black text-white border-black' 
                      : 'border-gray-300 text-black hover:bg-gray-50 bg-white'
                  }`}
                >
                  <span className="mr-2">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pain Level */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-black" />
              <h4 className="font-medium text-black">Pain Level</h4>
              <span className="text-lg font-bold text-black">{painLevel[0]}/10</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={painLevel[0]}
                onChange={(e) => setPainLevel([parseInt(e.target.value)])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #000 0%, #000 ${(painLevel[0] / 10) * 100}%, #e5e7eb ${(painLevel[0] / 10) * 100}%, #e5e7eb 100%)`
                }}
              />
            </div>
          </div>

          {/* Mood */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-black" />
              <h4 className="font-medium text-black">Mood</h4>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {moodOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setMood(option.value)}
                    className={`w-full flex flex-col h-auto p-3 space-y-1 rounded-md border transition-colors ${
                      mood === option.value 
                        ? 'bg-black text-white border-black' 
                        : 'border-gray-300 text-black hover:bg-gray-50 bg-white'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="text-xs">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sleep */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Moon className="w-5 h-5 text-black" />
              <h4 className="font-medium text-black">Sleep</h4>
              <span className="text-lg font-bold text-black">{sleep[0]}h</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={sleep[0]}
                onChange={(e) => setSleep([parseFloat(e.target.value)])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #000 0%, #000 ${(sleep[0] / 12) * 100}%, #e5e7eb ${(sleep[0] / 12) * 100}%, #e5e7eb 100%)`
                }}
              />
            </div>
          </div>

          {/* Body Temperature */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Thermometer className="w-5 h-5 text-black" />
              <h4 className="font-medium text-black">Temperature (°C)</h4>
            </div>
            <input
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="e.g. 36.5"
              className="w-full p-2 rounded-md bg-white border border-gray-300 text-black focus:border-black"
              step="0.1"
              min="30"
              max="45"
            />
          </div>

          {/* Energy Level */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-black" />
              <h4 className="font-medium text-black">Energy Level</h4>
              <span className="text-lg font-bold text-black">{energy[0]}/10</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={energy[0]}
                onChange={(e) => setEnergy([parseInt(e.target.value)])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #000 0%, #000 ${(energy[0] / 10) * 100}%, #e5e7eb ${(energy[0] / 10) * 100}%, #e5e7eb 100%)`
                }}
              />
            </div>
          </div>

          {/* Appetite */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Utensils className="w-5 h-5 text-black" />
              <h4 className="font-medium text-black">Appetite</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {appetiteOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setAppetite(option.value)}
                  className={`w-full justify-start h-auto p-3 rounded-md border transition-colors ${
                    appetite === option.value 
                      ? 'bg-black text-white border-black' 
                      : 'border-gray-300 text-black hover:bg-gray-50 bg-white'
                  }`}
                >
                  <span className="mr-2">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Water Intake */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Droplets className="w-5 h-5 text-black" />
              <h4 className="font-medium text-black">Water Intake</h4>
              <span className="text-lg font-bold text-black">{water[0]} glasses</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={water[0]}
                onChange={(e) => setWater([parseInt(e.target.value)])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #000 0%, #000 ${(water[0] / 15) * 100}%, #e5e7eb ${(water[0] / 15) * 100}%, #e5e7eb 100%)`
                }}
              />
            </div>
          </div>
        </div>

        {/* Exercise */}
        <div className="space-y-3 mt-6">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-black" />
            <h4 className="font-medium text-black">Exercise Intensity</h4>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {exerciseOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setExercise(option.value)}
                className={`w-full h-auto p-3 rounded-md border transition-colors ${
                  exercise === option.value 
                    ? 'bg-black text-white border-black' 
                    : 'border-gray-300 text-black hover:bg-gray-50 bg-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Symptoms */}
        <div className="space-y-3 mt-6">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-black" />
            <h4 className="font-medium text-black">Symptoms</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {commonSymptoms.map((symptom) => (
              <button
                key={symptom}
                onClick={() => toggleSymptom(symptom)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                  symptoms.includes(symptom) 
                    ? 'bg-black text-white hover:bg-gray-800' 
                    : 'border border-gray-300 text-black hover:bg-gray-50 bg-white'
                }`}
              >
                {symptoms.includes(symptom) && <X className="w-3 h-3 mr-1" />}
                {!symptoms.includes(symptom) && <Plus className="w-3 h-3 mr-1" />}
                {symptom}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-3 mt-6">
          <h4 className="font-medium text-black">Additional Notes</h4>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional thoughts or observations..."
            className="min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
          />
        </div>
      </Card>
    </div>
  );
};
