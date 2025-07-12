import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
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
      <Card className="p-6 bg-card/80 backdrop-blur-sm border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-foreground">Health Log</h3>
            <p className="text-sm text-muted-foreground">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" />
            Save Log
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Period Flow */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Droplets className="w-5 h-5 text-primary" />
              <h4 className="font-medium text-foreground">Period Flow</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {flowOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={flow === option.value ? "default" : "outline"}
                  onClick={() => setFlow(option.value)}
                  className="justify-start h-auto p-3"
                >
                  <span className="mr-2">{option.icon}</span>
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Pain Level */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-primary" />
              <h4 className="font-medium text-foreground">Pain Level</h4>
              <span className="text-lg font-bold text-primary">{painLevel[0]}/10</span>
            </div>
            <Slider
              value={painLevel}
              onValueChange={setPainLevel}
              max={10}
              step={1}
              className="w-full"
            />
          </div>

          {/* Mood */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-primary" />
              <h4 className="font-medium text-foreground">Mood</h4>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {moodOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <Button
                    key={option.value}
                    variant={mood === option.value ? "default" : "outline"}
                    onClick={() => setMood(option.value)}
                    className="flex flex-col h-auto p-3 space-y-1"
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="text-xs">{option.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Sleep */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Moon className="w-5 h-5 text-primary" />
              <h4 className="font-medium text-foreground">Sleep</h4>
              <span className="text-lg font-bold text-primary">{sleep[0]}h</span>
            </div>
            <Slider
              value={sleep}
              onValueChange={setSleep}
              max={12}
              min={0}
              step={0.5}
              className="w-full"
            />
          </div>

          {/* Body Temperature */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Thermometer className="w-5 h-5 text-primary" />
              <h4 className="font-medium text-foreground">Temperature (°C)</h4>
            </div>
            <input
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="e.g. 36.5"
              className="w-full p-2 rounded-md bg-background border border-border text-foreground"
              step="0.1"
              min="30"
              max="45"
            />
          </div>

          {/* Energy Level */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-primary" />
              <h4 className="font-medium text-foreground">Energy Level</h4>
              <span className="text-lg font-bold text-primary">{energy[0]}/10</span>
            </div>
            <Slider
              value={energy}
              onValueChange={setEnergy}
              max={10}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          {/* Appetite */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Utensils className="w-5 h-5 text-primary" />
              <h4 className="font-medium text-foreground">Appetite</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {appetiteOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={appetite === option.value ? "default" : "outline"}
                  onClick={() => setAppetite(option.value)}
                  className="justify-start h-auto p-3"
                >
                  <span className="mr-2">{option.icon}</span>
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Water Intake */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              <h4 className="font-medium text-foreground">Water Intake</h4>
              <span className="text-lg font-bold text-primary">{water[0]} glasses</span>
            </div>
            <Slider
              value={water}
              onValueChange={setWater}
              max={15}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Exercise */}
        <div className="space-y-3 mt-6">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-primary" />
            <h4 className="font-medium text-foreground">Exercise Intensity</h4>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {exerciseOptions.map((option) => (
              <Button
                key={option.value}
                variant={exercise === option.value ? "default" : "outline"}
                onClick={() => setExercise(option.value)}
                className="h-auto p-3"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Symptoms */}
        <div className="space-y-3 mt-6">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary" />
            <h4 className="font-medium text-foreground">Symptoms</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {commonSymptoms.map((symptom) => (
              <Badge
                key={symptom}
                variant={symptoms.includes(symptom) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80"
                onClick={() => toggleSymptom(symptom)}
              >
                {symptoms.includes(symptom) && <X className="w-3 h-3 mr-1" />}
                {!symptoms.includes(symptom) && <Plus className="w-3 h-3 mr-1" />}
                {symptom}
              </Badge>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-3 mt-6">
          <h4 className="font-medium text-foreground">Additional Notes</h4>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional thoughts or observations..."
            className="min-h-[80px] bg-background/50"
          />
        </div>
      </Card>
    </div>
  );
};
