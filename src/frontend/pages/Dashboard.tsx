import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import Loading from "../components/Loading";
import OnboardingSidebar from "../components/OnboardingSidebar";
import WelcomeModal from "../components/WelcomeModal";
import AiAssistantPanel from "../components/AiAssistantPanel";
import AppLayout from "../components/AppLayout";
import CreateTeamModal from "../components/CreateTeamModal";
import CreatePlayModal from "../components/CreatePlayModal";
import CreateSignalModal from "../components/CreateSignalModal";

export default function Dashboard() {
  const [stats, setStats] = useState({ playCount: 0, signalCount: 0 });
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showCreatePlayModal, setShowCreatePlayModal] = useState(false);
  const [showCreateSignalModal, setShowCreateSignalModal] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState<any>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [userData, playsData, onboardingData] = await Promise.all([
        fetch('/me', { credentials: 'include' }).then(res => res.json()),
        fetch('/api/plays', { credentials: 'include' }).then(res => res.json()).catch(() => ({ plays: [] })),
        fetch('/api/onboarding/status', { credentials: 'include' }).then(res => res.json()).catch(() => null)
      ]);
      
      setUser(userData);
      setStats({ 
        playCount: playsData.plays?.length || 0, 
        signalCount: 0 // TODO: Add signal count endpoint
      });
      setOnboardingStatus(onboardingData);

      // Show welcome modal if onboarding was just completed
      if (onboardingData?.isOnboarded && !localStorage.getItem('welcome-shown')) {
        setShowWelcomeModal(true);
        localStorage.setItem('welcome-shown', 'true');
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    loadDashboardData(); // Refresh data after successful creation
  };

  const handleOnboardingStep = (step: string) => {
    switch (step) {
      case 'profile':
        window.location.href = '/settings';
        break;
      case 'team':
        setShowCreateTeamModal(true);
        break;
      case 'play':
        setShowCreatePlayModal(true);
        break;
      case 'signal':
        setShowCreateSignalModal(true);
        break;
    }
  };

  const handleOnboardingSkip = () => {
    loadDashboardData(); // Refresh to hide onboarding sidebar
  };

  if (loading) return <Loading />;

  return (
    <AppLayout maxWidth="7xl" className="py-8">
      <div className="flex gap-8">
        {onboardingStatus && !onboardingStatus.isOnboarded && (
          <OnboardingSidebar 
            onStepClick={handleOnboardingStep}
            onSkip={handleOnboardingSkip}
          />
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            {user?.is_premium && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                ⭐ Premium
              </Badge>
            )}
          </div>
          {/* Stats Cards - Mobile responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="transition-all hover:shadow-lg hover:scale-[1.02]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Active Plays</span>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{stats.playCount}</p>
              </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-lg hover:scale-[1.02]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Signals Logged</span>
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{stats.signalCount}</p>
              </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-lg hover:scale-[1.02] sm:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Team Activity</span>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">Active</p>
                <p className="text-sm text-muted-foreground">Team is engaged</p>
              </CardContent>
            </Card>
          </div>
          {/* Quick Actions - Mobile responsive grid */}
          <Card className="transition-all hover:shadow-lg mb-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-muted cursor-pointer transition-all hover:scale-105"
                  onClick={() => setShowCreatePlayModal(true)}
                >
                  <div className="text-2xl">🎯</div>
                  <p className="font-medium text-foreground">Create Play</p>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-muted cursor-pointer transition-all hover:scale-105"
                  onClick={() => setShowCreateSignalModal(true)}
                >
                  <div className="text-2xl">📊</div>
                  <p className="font-medium text-foreground">Log Signal</p>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-muted cursor-pointer transition-all hover:scale-105 sm:col-span-2 lg:col-span-1"
                  onClick={() => setShowCreateTeamModal(true)}
                >
                  <div className="text-2xl">👥</div>
                  <p className="font-medium text-foreground">Create Team</p>
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* AI Assistant Panel */}
          <div className="flex justify-center">
            <AiAssistantPanel />
          </div>
        </div>
      </div>
      {/* Modals */}
      <CreateTeamModal
        isOpen={showCreateTeamModal}
        onClose={() => setShowCreateTeamModal(false)}
        onSuccess={handleSuccess}
      />
      <CreatePlayModal
        isOpen={showCreatePlayModal}
        onClose={() => setShowCreatePlayModal(false)}
        onSuccess={handleSuccess}
      />
      <CreateSignalModal
        isOpen={showCreateSignalModal}
        onClose={() => setShowCreateSignalModal(false)}
        onSuccess={handleSuccess}
      />
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />
    </AppLayout>
  );
} 