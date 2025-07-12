import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface OnboardingStatus {
  hasCompletedProfile: boolean;
  hasJoinedTeam: boolean;
  hasCreatedPlay: boolean;
  hasLoggedSignal: boolean;
  isOnboarded: boolean;
  currentTeamId: string | null;
}

interface OnboardingSidebarProps {
  onStepClick?: (step: string) => void;
  onSkip?: () => void;
}

export default function OnboardingSidebar({ onStepClick, onSkip }: OnboardingSidebarProps) {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOnboardingStatus();
  }, []);

  const loadOnboardingStatus = async () => {
    try {
      const response = await fetch('/api/onboarding/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to load onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      const response = await fetch('/api/onboarding/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        await loadOnboardingStatus();
        onSkip?.();
      }
    } catch (error) {
      console.error('Failed to skip onboarding:', error);
    }
  };

  if (loading) {
    return (
      <Card className="w-80">
        <CardHeader>
          <CardTitle>Onboarding Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-muted rounded-full"></div>
                <div className="flex-1 h-4 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status || status.isOnboarded) {
    return null;
  }

  const steps = [
    {
      id: 'profile',
      title: 'Complete Profile',
      description: 'Add your name, role, and avatar',
      completed: status.hasCompletedProfile,
      action: () => onStepClick?.('profile')
    },
    {
      id: 'team',
      title: 'Join or Create Team',
      description: 'Connect with your team',
      completed: status.hasJoinedTeam,
      action: () => onStepClick?.('team')
    },
    {
      id: 'play',
      title: 'Create First Play',
      description: 'Set up your first play',
      completed: status.hasCreatedPlay,
      action: () => onStepClick?.('play')
    },
    {
      id: 'signal',
      title: 'Log First Signal',
      description: 'Record your first observation',
      completed: status.hasLoggedSignal,
      action: () => onStepClick?.('signal')
    }
  ];

  const completedCount = steps.filter(step => step.completed).length;
  const progressPercentage = (completedCount / steps.length) * 100;

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Onboarding Progress</span>
          <Badge variant="secondary">{completedCount}/4</Badge>
        </CardTitle>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
              step.completed 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-muted/50 hover:bg-muted'
            }`}
            onClick={step.action}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
              step.completed 
                ? 'bg-green-500 text-white' 
                : 'bg-muted-foreground/20 text-muted-foreground'
            }`}>
              {step.completed ? '✓' : index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">
                {step.title}
              </div>
              <div className="text-xs text-muted-foreground">
                {step.description}
              </div>
            </div>
          </div>
        ))}

        <div className="pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSkip}
            className="w-full"
          >
            Skip Onboarding
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            You can always complete these steps later
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 