import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

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
  return (
    <aside className="w-full max-w-xs p-4 bg-muted rounded-lg mb-8">
      <h2 className="text-lg font-bold mb-4">Onboarding</h2>
      <div className="text-muted-foreground text-sm mb-4">
        Onboarding progress and tasks will appear here soon.
      </div>
      <Button disabled className="w-full">Coming Soon</Button>
    </aside>
  );
} 