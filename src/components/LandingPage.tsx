
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Heart, TrendingUp, Shield } from 'lucide-react';

interface LandingPageProps {
  onSignUp: () => void;
  onLogin: () => void;
}

export const LandingPage = ({ onSignUp, onLogin }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Perica
          </span>
        </div>
        <div className="space-x-4">
          <Button variant="ghost" onClick={onLogin} className="text-muted-foreground hover:text-primary">
            Log In
          </Button>
          <Button onClick={onSignUp} className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white">
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
          Your period,<br />predicted & understood
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Track your cycle, predict your periods, and understand your body with science-backed insights. 
          Take control of your reproductive health.
        </p>
        <Button 
          onClick={onSignUp}
          size="lg" 
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Start Tracking Today
        </Button>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-300 border border-border bg-card">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Smart Calendar</h3>
            <p className="text-sm text-muted-foreground">
              Visual calendar with period predictions, fertile windows, and ovulation tracking
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-300 border border-border bg-card">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Symptom Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Log mood, pain, flow, and more to understand your unique patterns
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-300 border border-border bg-card">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Cycle Insights</h3>
            <p className="text-sm text-muted-foreground">
              Get personalized insights about your cycle patterns and health trends
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-300 border border-border bg-card">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Privacy First</h3>
            <p className="text-sm text-muted-foreground">
              Your data is encrypted and private. We never share your personal information
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="bg-card border border-border rounded-3xl p-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            Ready to understand your cycle?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of people who trust Perica to track their periods and understand their bodies better.
          </p>
          <Button 
            onClick={onSignUp}
            size="lg" 
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Get Started Free
          </Button>
        </div>
      </section>
    </div>
  );
};
