import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <CardTitle className="text-2xl">Welcome to Rhythm90!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Congratulations! You've completed the onboarding process and are ready to start tracking signals and optimizing your marketing plays.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-sm">Suggested Next Steps:</h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                <div className="text-lg">👥</div>
                <div>
                  <div className="font-medium text-sm">Invite Your Team</div>
                  <div className="text-xs text-muted-foreground">
                    Share Rhythm90 with your colleagues to collaborate on plays and signals
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                <div className="text-lg">🤖</div>
                <div>
                  <div className="font-medium text-sm">Try AI Assistant</div>
                  <div className="text-xs text-muted-foreground">
                    Get AI-powered insights and suggestions for your marketing strategy
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                <div className="text-lg">📊</div>
                <div>
                  <div className="font-medium text-sm">Explore Analytics</div>
                  <div className="text-xs text-muted-foreground">
                    View detailed analytics and track your team's performance
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                <div className="text-lg">🔗</div>
                <div>
                  <div className="font-medium text-sm">Connect Integrations</div>
                  <div className="text-xs text-muted-foreground">
                    Set up API keys and connect your existing tools
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/team'}
              className="flex-1"
            >
              👥 Invite Team
            </Button>
            <Button 
              onClick={onClose}
              className="flex-1"
            >
              Get Started
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              You can always access these features from the main navigation
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 