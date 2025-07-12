import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";


interface OnboardingStatus {
  hasCompletedProfile: boolean;
  hasJoinedTeam: boolean;
  hasCreatedPlay: boolean;
  hasLoggedSignal: boolean;
}

const ONBOARDING_ITEMS = [
  {
    id: "profile",
    title: "Complete your profile",
    description: "Set up your name and basic information",
    icon: "👤",
    field: "hasCompletedProfile" as keyof OnboardingStatus
  },
  {
    id: "team",
    title: "Join or create a team",
    description: "Connect with your team members",
    icon: "👥",
    field: "hasJoinedTeam" as keyof OnboardingStatus
  },
  {
    id: "play",
    title: "Create your first play",
    description: "Set up a marketing play to track signals",
    icon: "🎯",
    field: "hasCreatedPlay" as keyof OnboardingStatus
  },
  {
    id: "signal",
    title: "Log your first signal",
    description: "Track an observation for your play",
    icon: "📊",
    field: "hasLoggedSignal" as keyof OnboardingStatus
  }
];

export default function OnboardingSidebar() {
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOnboardingStatus();
  }, []);

  const fetchOnboardingStatus = async () => {
    try {
      const response = await fetch('/api/onboarding-status', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setOnboardingStatus(data);
      } else {
        console.error('Failed to fetch onboarding status');
      }
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletedCount = () => {
    if (!onboardingStatus) return 0;
    return Object.values(onboardingStatus).filter(Boolean).length;
  };

  const isCompleted = (field: keyof OnboardingStatus) => {
    return onboardingStatus?.[field] || false;
  };

  if (loading) {
    return (
      <aside className="w-full max-w-xs p-4 bg-muted rounded-lg mb-8">
        <h2 className="text-lg font-bold mb-4">Onboarding</h2>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </aside>
    );
  }

  const completedCount = getCompletedCount();
  const totalItems = ONBOARDING_ITEMS.length;

  return (
    <aside className="w-full max-w-xs p-4 bg-muted rounded-lg mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Onboarding</h2>
        <Badge variant="secondary">
          {completedCount}/{totalItems}
        </Badge>
      </div>
      
      <div className="space-y-3">
        {ONBOARDING_ITEMS.map((item) => (
          <div
            key={item.id}
            className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
              isCompleted(item.field) 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {isCompleted(item.field) ? (
                <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
              ) : (
                <span className="text-gray-400 text-lg">○</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{item.icon}</span>
                <h3 className={`text-sm font-medium ${
                  isCompleted(item.field) 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {item.title}
                </h3>
              </div>
              <p className={`text-xs mt-1 ${
                isCompleted(item.field) 
                  ? 'text-green-600 dark:text-green-300' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {completedCount === totalItems && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              Onboarding complete! 🎉
            </span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-300 mt-1">
            You're all set up and ready to go.
          </p>
        </div>
      )}
    </aside>
  );
} 