
import { useState, useEffect } from 'react';
import { LandingPage } from '@/components/LandingPage';
import { AuthModal } from '@/components/AuthModal';
import { Dashboard } from '@/components/Dashboard';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

const Index = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    console.log('Auth state changed:', { user: user?.id, loading: authLoading, profileLoading });
    
    if (user && !profileLoading) {
      console.log('User found, checking profile:', profile);
      // Check if user needs onboarding (no profile data)
      if (!profile || (!profile.date_of_birth && !profile.average_cycle_length)) {
        console.log('Redirecting to onboarding');
        setShowOnboarding(true);
        setShowAuth(false); // Make sure auth modal is closed
      } else {
        console.log('Redirecting to dashboard');
        setShowOnboarding(false);
        setShowAuth(false); // Make sure auth modal is closed
      }
    }
  }, [user, profile, profileLoading, authLoading]);

  const handleAuthSuccess = () => {
    console.log('Auth success called');
    setShowAuth(false);
    // Don't redirect here - let the useEffect handle it based on auth state
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-black rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user && showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  if (user) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-white">
      <LandingPage 
        onSignUp={() => {
          setAuthMode('signup');
          setShowAuth(true);
        }}
        onLogin={() => {
          setAuthMode('login');
          setShowAuth(true);
        }}
      />
      
      {showAuth && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
          onSwitchMode={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
        />
      )}
    </div>
  );
};

export default Index;
