import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { trackEvent, AnalyticsEvents } from './useAnalytics';

export function useOnboarding() {
  const { user } = useAuth();
  const [showTour, setShowTour] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);

  useEffect(() => {
    if (user) {
      checkTourStatus();
    }
  }, [user]);

  async function checkTourStatus() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/onboarding-status`);
      if (res.ok) {
        const data = await res.json();
        setHasCompletedTour(data.hasCompletedTour || false);
        
        // Show tour for new users who haven't completed it
        if (!data.hasCompletedTour) {
          setShowTour(true);
        }
      }
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
    }
  }

  async function completeTour() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/complete-onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        setHasCompletedTour(true);
        setShowTour(false);
        trackEvent(AnalyticsEvents.ONBOARDING_COMPLETED);
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  }

  async function skipTour() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/skip-onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        setHasCompletedTour(true);
        setShowTour(false);
        trackEvent(AnalyticsEvents.ONBOARDING_SKIPPED);
      }
    } catch (error) {
      console.error('Failed to skip onboarding:', error);
    }
  }

  function restartTour() {
    setShowTour(true);
    trackEvent(AnalyticsEvents.ONBOARDING_RESTARTED);
  }

  return {
    showTour,
    hasCompletedTour,
    completeTour,
    skipTour,
    restartTour
  };
} 