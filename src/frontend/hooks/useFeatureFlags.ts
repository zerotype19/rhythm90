import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

interface FeatureFlags {
  [key: string]: boolean;
}

interface ExperimentVariant {
  variant: string;
  weight: number;
}

interface Experiment {
  id: string;
  name: string;
  description: string;
  variants: string[];
  isActive: boolean;
  adminNotes?: string;
}

interface ExperimentAssignment {
  experimentId: string;
  variant: string;
  assignedAt: string;
}

export function useFeatureFlags() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [userAssignments, setUserAssignments] = useState<ExperimentAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load experiments and user assignments
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadExperiments = async () => {
      try {
        const [experimentsRes, assignmentsRes] = await Promise.all([
          fetch('/api/experiments'),
          fetch('/api/user/experiments')
        ]);

        if (experimentsRes.ok) {
          const experimentsData = await experimentsRes.json();
          setExperiments(experimentsData.experiments || []);
        }

        if (assignmentsRes.ok) {
          const assignmentsData = await assignmentsRes.json();
          setUserAssignments(assignmentsData.assignments || []);
        }
      } catch (error) {
        console.error('Error loading experiments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExperiments();
  }, [user]);

  // Hard split A/B logic with on-the-fly assignment
  const getExperimentVariant = useCallback((experimentId: string): string => {
    if (!user) return 'A'; // Default for non-authenticated users

    // Check if user already has an assignment
    const existingAssignment = userAssignments.find(a => a.experimentId === experimentId);
    if (existingAssignment) {
      return existingAssignment.variant;
    }

    // Get experiment details
    const experiment = experiments.find(e => e.id === experimentId);
    if (!experiment || !experiment.isActive) {
      return 'A'; // Default if experiment not found or inactive
    }

    // Create deterministic assignment based on user ID and experiment ID
    const hash = simpleHash(`${user.id}-${experimentId}`);
    const variantIndex = hash % experiment.variants.length;
    const assignedVariant = experiment.variants[variantIndex];

    // Store assignment (this will be persisted on next page load)
    const newAssignment: ExperimentAssignment = {
      experimentId,
      variant: assignedVariant,
      assignedAt: new Date().toISOString()
    };

    setUserAssignments(prev => [...prev, newAssignment]);

    // Persist assignment to backend
    fetch('/api/user/experiments/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAssignment)
    }).catch(error => {
      console.error('Error persisting experiment assignment:', error);
    });

    return assignedVariant;
  }, [user, experiments, userAssignments]);

  // Track experiment event
  const trackExperimentEvent = useCallback(async (
    experimentId: string, 
    eventType: string, 
    eventData?: any
  ) => {
    if (!user) return;

    const variant = getExperimentVariant(experimentId);
    
    try {
      await fetch('/api/experiments/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experimentId,
          variant,
          eventType,
          eventData
        })
      });
    } catch (error) {
      console.error('Error tracking experiment event:', error);
    }
  }, [user, getExperimentVariant]);

  // Track CTA click
  const trackCTA = useCallback(async (
    ctaType: string,
    ctaLocation: string,
    experimentId?: string,
    variant?: string
  ) => {
    try {
      await fetch('/api/track/cta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ctaType,
          ctaLocation,
          experimentId,
          variant,
          sessionId: sessionStorage.getItem('sessionId') || undefined
        })
      });
    } catch (error) {
      console.error('Error tracking CTA:', error);
    }
  }, []);

  // Track Product Hunt interaction
  const trackProductHunt = useCallback(async (actionType: string) => {
    try {
      await fetch('/api/track/product-hunt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType,
          sessionId: sessionStorage.getItem('sessionId') || undefined
        })
      });
    } catch (error) {
      console.error('Error tracking Product Hunt interaction:', error);
    }
  }, []);

  // Simple hash function for deterministic assignment
  const simpleHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };

  return {
    experiments,
    userAssignments,
    loading,
    getExperimentVariant,
    trackExperimentEvent,
    trackCTA,
    trackProductHunt
  };
} 