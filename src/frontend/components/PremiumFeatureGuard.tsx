import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useAuth } from '../hooks/useAuth';

interface PremiumFeatureGuardProps {
  children: React.ReactNode;
  feature: string;
  fallback?: React.ReactNode;
}

export default function PremiumFeatureGuard({ 
  children, 
  feature, 
  fallback 
}: PremiumFeatureGuardProps) {
  const { user } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const isPremium = user?.is_premium || false;

  if (isPremium) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <>
      <div className="relative">
        <div className="blur-sm pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <span className="text-2xl">⭐</span>
              </div>
              <CardTitle>Premium Feature</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                {feature} is a premium feature. Upgrade to access advanced capabilities.
              </p>
              <div className="flex flex-col gap-2">
                <Button onClick={() => setShowUpgradeModal(true)}>
                  Upgrade to Premium
                </Button>
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                Upgrade to Premium
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Premium Features Include:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    AI Assistant & Hypothesis Generation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Advanced Analytics & Reporting
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    API Access & Developer Portal
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Unlimited Teams & Plays
                  </li>
                </ul>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">$29/month</div>
                  <div className="text-sm text-muted-foreground">per team</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={() => {
                    // TODO: Redirect to billing page
                    window.location.href = '/billing';
                  }}
                >
                  Start Free Trial
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowUpgradeModal(false)}
                >
                  Maybe Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
} 