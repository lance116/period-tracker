
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';

interface SymptomLoggerProps {
  selectedDate: Date;
}

export const SymptomLogger = ({ selectedDate }: SymptomLoggerProps) => {
  const [flow, setFlow] = useState<string>('');
  const [pain, setPain] = useState<number[]>([0]);
  const [mood, setMood] = useState<string>('');
  const [sleep, setSleep] = useState<number[]>([8]);
  const [notes, setNotes] = useState<string>('');

  const flowOptions = [
    { value: 'none', label: 'None', color: 'bg-gray-300' },
    { value: 'light', label: 'Light', color: 'bg-pink-300' },
    { value: 'medium', label: 'Medium', color: 'bg-red-400' },
    { value: 'heavy', label: 'Heavy', color: 'bg-red-600' },
  ];

  const moodOptions = [
    { value: 'happy', label: '😊 Happy', color: 'bg-yellow-300' },
    { value: 'neutral', label: '😐 Neutral', color: 'bg-gray-300' },
    { value: 'sad', label: '😢 Sad', color: 'bg-blue-300' },
    { value: 'irritable', label: '😤 Irritable', color: 'bg-red-300' },
    { value: 'anxious', label: '😰 Anxious', color: 'bg-purple-300' },
  ];

  const handleSave = () => {
    const logData = {
      date: selectedDate,
      flow,
      pain: pain[0],
      mood,
      sleep: sleep[0],
      notes,
    };
    console.log('Saving log:', logData);
    // Here you would typically save to a backend
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white/80 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Daily Log - {selectedDate.toLocaleDateString()}
        </h2>

        <div className="space-y-8">
          {/* Flow Tracking */}
          <div>
            <Label className="text-base font-semibold text-gray-700 mb-3 block">
              Period Flow
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {flowOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFlow(option.value)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    flow === option.value
                      ? 'border-pink-500 ring-2 ring-pink-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full ${option.color} mx-auto mb-2`}></div>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pain Level */}
          <div>
            <Label className="text-base font-semibold text-gray-700 mb-3 block">
              Pain Level: {pain[0]}/10
            </Label>
            <div className="px-4">
              <Slider
                value={pain}
                onValueChange={setPain}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>No pain</span>
                <span>Severe pain</span>
              </div>
            </div>
          </div>

          {/* Mood Tracking */}
          <div>
            <Label className="text-base font-semibold text-gray-700 mb-3 block">
              Mood
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setMood(option.value)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                    mood === option.value
                      ? 'border-purple-500 ring-2 ring-purple-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-lg mb-1">{option.label.split(' ')[0]}</div>
                  <span className="text-xs font-medium">{option.label.split(' ')[1]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sleep Tracking */}
          <div>
            <Label className="text-base font-semibold text-gray-700 mb-3 block">
              Sleep Hours: {sleep[0]}h
            </Label>
            <div className="px-4">
              <Slider
                value={sleep}
                onValueChange={setSleep}
                min={0}
                max={12}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0h</span>
                <span>12h</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-base font-semibold text-gray-700 mb-3 block">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about your day..."
              className="min-h-[100px]"
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-3"
          >
            Save Daily Log
          </Button>
        </div>
      </Card>
    </div>
  );
};
