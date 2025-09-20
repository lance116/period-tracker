
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Heart, TrendingUp, Shield, ArrowRight, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onSignUp: () => void;
  onLogin: () => void;
}

export const LandingPage = ({ onSignUp, onLogin }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold text-black">
              Perica
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onLogin} className="text-gray-600 hover:text-black">
              Sign In
            </Button>
            <Button onClick={onSignUp} className="bg-black text-white hover:bg-gray-800">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-black leading-tight">
            Your period,<br />
            <span className="text-gray-800">predicted & understood</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Track your cycle, predict your periods, and understand your body with science-backed insights. 
            Take control of your reproductive health.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onSignUp}
              size="lg" 
              className="bg-black text-white hover:bg-gray-800 px-8 py-6 text-lg h-auto"
            >
              Start Tracking Today
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-gray-400 text-white hover:bg-gray-50 px-8 py-6 text-lg h-auto"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-black">
              Everything you need to understand your cycle
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive tracking and insights designed for your unique needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-gray-200 hover:border-gray-300 transition-colors bg-black">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg text-white">Smart Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white text-center">
                  Visual calendar with period predictions, fertile windows, and ovulation tracking
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:border-gray-300 transition-colors bg-black">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg text-white">Symptom Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white text-center">
                  Log mood, pain, flow, and more to understand your unique patterns
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:border-gray-300 transition-colors bg-black">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg text-white">Cycle Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white text-center">
                  Get personalized insights about your cycle patterns and health trends
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:border-gray-300 transition-colors bg-black">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg text-white">Privacy First</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white text-center">
                  Your data is encrypted and private. We never share your personal information
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-black">
                Why thousands choose Perica
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-black mb-1">Accurate Predictions</h3>
                    <p className="text-gray-600">AI-powered algorithms learn your unique cycle patterns</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-black mb-1">Comprehensive Tracking</h3>
                    <p className="text-gray-600">Track symptoms, mood, flow, and more in one place</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-black mb-1">Privacy & Security</h3>
                    <p className="text-gray-600">End-to-end encryption keeps your data safe and private</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">Ready to start?</h3>
                <p className="text-gray-600 mb-6">Start tracking your cycle today</p>
                <Button 
                  onClick={onSignUp}
                  className="w-full bg-black text-white hover:bg-gray-800"
                >
                  Get Started Free
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-black text-white">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-bold mb-6">
            Ready to understand your cycle?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Track your periods and understand your body better with Perica.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onSignUp}
              size="lg" 
              className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg h-auto"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
              <Heart className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-600">Perica</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
