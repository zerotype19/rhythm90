import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { fetchOnboardingStatus, completeOnboardingItem } from "../utils/api";

interface OnboardingItem {
  item: string;
  completed_at: string | null;
}

const ONBOARDING_ITEMS = [
  {
    id: "create_play",
    title: "Create your first play",
    description: "Set up a marketing play to track signals",
    icon: "🎯"
  },
  {
    id: "connect_slack",
    title: "Connect Slack/Teams",
    description: "Integrate with your team communication",
    icon: "💬"
  },
  {
    id: "explore_help",
    title: "Explore Help Center",
    description: "Learn how to use Rhythm90 effectively",
    icon: "📚"
  },
  {
    id: "invite_team",
    title: "Invite your team",
    description: "Bring your team members on board",
    icon: "👥"
  }
];

export default function OnboardingSidebar() {
  const [onboardingItems, setOnboardingItems] = useState<OnboardingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingItem, setCompletingItem] = useState<string | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    loadOnboardingStatus();
    // Check if user has dismissed the onboarding
    const dismissed = localStorage.getItem("onboarding_dismissed");
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  async function loadOnboardingStatus() {
    try {
      const data = await fetchOnboardingStatus();
      setOnboardingItems(data.items || []);
    } catch (error) {
      console.error("Failed to load onboarding status:", error);
    } finally {
      setLoading(false);
    }
  }

  async function completeItem(itemId: string) {
    setCompletingItem(itemId);
    try {
      await completeOnboardingItem(itemId);
      // Update local state
      setOnboardingItems(prev => 
        prev.map(item => 
          item.item === itemId 
            ? { ...item, completed_at: new Date().toISOString() }
            : item
        )
      );
    } catch (error) {
      console.error("Failed to complete onboarding item:", error);
    } finally {
      setCompletingItem(null);
    }
  }

  function dismissOnboarding() {
    setIsDismissed(true);
    localStorage.setItem("onboarding_dismissed", "true");
  }

  function isItemCompleted(itemId: string): boolean {
    return onboardingItems.some(item => item.item === itemId && item.completed_at);
  }

  function getCompletedCount(): number {
    return onboardingItems.filter(item => item.completed_at).length;
  }

  function getProgressPercentage(): number {
    return (getCompletedCount() / ONBOARDING_ITEMS.length) * 100;
  }

  // Don't show if dismissed or all items completed
  if (isDismissed || getCompletedCount() === ONBOARDING_ITEMS.length) {
    return null;
  }

  if (loading) {
    return (
      <div className="fixed right-4 top-20 w-80 z-50">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed right-4 top-20 w-80 z-50">
      <Card className="shadow-lg border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Welcome to Rhythm90! 🚀</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissOnboarding}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {getCompletedCount()}/{ONBOARDING_ITEMS.length}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {ONBOARDING_ITEMS.map((item) => {
              const completed = isItemCompleted(item.id);
              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
                    completed 
                      ? "bg-green-50 dark:bg-green-900/20" 
                      : "bg-gray-50 dark:bg-gray-800/50"
                  }`}
                >
                  <div className="text-xl">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-medium ${
                        completed ? "text-green-700 dark:text-green-300" : "text-gray-900 dark:text-gray-100"
                      }`}>
                        {item.title}
                      </h4>
                      {completed && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                          ✓
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {item.description}
                    </p>
                  </div>
                  {!completed && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => completeItem(item.id)}
                      disabled={completingItem === item.id}
                      className="text-xs"
                    >
                      {completingItem === item.id ? "..." : "Mark Done"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 