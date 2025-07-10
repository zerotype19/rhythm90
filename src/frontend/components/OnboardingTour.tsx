import { useEffect, useRef } from 'react';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

interface OnboardingTourProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingTour({ isVisible, onComplete, onSkip }: OnboardingTourProps) {
  const tourRef = useRef<Shepherd.Tour | null>(null);

  useEffect(() => {
    if (!isVisible) return;

    // Initialize Shepherd tour
    tourRef.current = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: {
          enabled: true
        },
        classes: 'shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
        scrollTo: true
      },
      useModalOverlay: true
    });

    // Step 1: Welcome
    tourRef.current.addStep({
      id: 'welcome',
      text: `
        <div class="text-center">
          <h3 class="text-lg font-semibold mb-2">Welcome to Rhythm90! 🎉</h3>
          <p class="text-gray-600 dark:text-gray-300">
            Let's take a quick tour to help you get started with tracking marketing signals and running smarter quarters.
          </p>
        </div>
      `,
      buttons: [
        {
          text: 'Skip Tour',
          action: () => {
            tourRef.current?.cancel();
            onSkip();
          },
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Start Tour',
          action: () => tourRef.current?.next(),
          classes: 'shepherd-button-primary'
        }
      ]
    });

    // Step 2: Play Canvas
    tourRef.current.addStep({
      id: 'play-canvas',
      attachTo: {
        element: '.play-canvas-section, .board-section, [data-tour="play-canvas"]',
        on: 'bottom'
      },
      text: `
        <div>
          <h3 class="text-lg font-semibold mb-2">🎯 Play Canvas</h3>
          <p class="text-gray-600 dark:text-gray-300">
            This is where you'll create and manage your marketing plays. Each play represents a strategic initiative with clear outcomes.
          </p>
        </div>
      `,
      buttons: [
        {
          text: 'Previous',
          action: () => tourRef.current?.back(),
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: () => tourRef.current?.next(),
          classes: 'shepherd-button-primary'
        }
      ]
    });

    // Step 3: Analytics
    tourRef.current.addStep({
      id: 'analytics',
      attachTo: {
        element: '.analytics-section, [data-tour="analytics"]',
        on: 'bottom'
      },
      text: `
        <div>
          <h3 class="text-lg font-semibold mb-2">📊 Analytics Dashboard</h3>
          <p class="text-gray-600 dark:text-gray-300">
            Track your marketing performance with comprehensive analytics. Monitor plays, signals, and team activity in real-time.
          </p>
        </div>
      `,
      buttons: [
        {
          text: 'Previous',
          action: () => tourRef.current?.back(),
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: () => tourRef.current?.next(),
          classes: 'shepherd-button-primary'
        }
      ]
    });

    // Step 4: Settings & API
    tourRef.current.addStep({
      id: 'settings-api',
      attachTo: {
        element: '.settings-section, .developer-section, [data-tour="settings"]',
        on: 'bottom'
      },
      text: `
        <div>
          <h3 class="text-lg font-semibold mb-2">⚙️ Settings & API</h3>
          <p class="text-gray-600 dark:text-gray-300">
            Manage your team settings, API keys, and integrations. You can also restart this tour anytime from your settings.
          </p>
        </div>
      `,
      buttons: [
        {
          text: 'Previous',
          action: () => tourRef.current?.back(),
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Finish',
          action: () => {
            tourRef.current?.complete();
            onComplete();
          },
          classes: 'shepherd-button-primary'
        }
      ]
    });

    // Start the tour
    tourRef.current.start();

    // Cleanup function
    return () => {
      if (tourRef.current) {
        tourRef.current.destroy();
        tourRef.current = null;
      }
    };
  }, [isVisible, onComplete, onSkip]);

  // Don't render anything - Shepherd handles the UI
  return null;
} 