import { useState, useEffect } from 'react';

interface Experiment {
  id: string;
  name: string;
  description: string;
  variants: string;
  variant?: string;
}

interface ExperimentEvent {
  experimentId: string;
  eventType: 'exposure' | 'interaction' | 'conversion';
  eventData?: any;
}

export function useGrowthExperiments() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExperiments();
  }, []);

  const loadExperiments = async () => {
    try {
      const response = await fetch('/growth/experiments');
      const data = await response.json();
      
      if (data.success) {
        setExperiments(data.experiments || []);
      }
    } catch (error) {
      console.error('Failed to load experiments:', error);
    } finally {
      setLoading(false);
    }
  };

  const logEvent = async (experimentId: string, eventType: 'exposure' | 'interaction' | 'conversion', eventData?: any) => {
    try {
      await fetch('/growth/experiments/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experimentId,
          eventType,
          eventData
        })
      });
    } catch (error) {
      console.error('Failed to log experiment event:', error);
    }
  };

  const getExperimentVariant = (experimentName: string): string | null => {
    const experiment = experiments.find(exp => exp.name === experimentName);
    return experiment?.variant || null;
  };

  const isInExperiment = (experimentName: string): boolean => {
    return getExperimentVariant(experimentName) !== null;
  };

  const logExposure = (experimentName: string) => {
    const experiment = experiments.find(exp => exp.name === experimentName);
    if (experiment) {
      logEvent(experiment.id, 'exposure');
    }
  };

  const logInteraction = (experimentName: string, interactionData?: any) => {
    const experiment = experiments.find(exp => exp.name === experimentName);
    if (experiment) {
      logEvent(experiment.id, 'interaction', interactionData);
    }
  };

  const logConversion = (experimentName: string, conversionData?: any) => {
    const experiment = experiments.find(exp => exp.name === experimentName);
    if (experiment) {
      logEvent(experiment.id, 'conversion', conversionData);
    }
  };

  return {
    experiments,
    loading,
    getExperimentVariant,
    isInExperiment,
    logExposure,
    logInteraction,
    logConversion,
    refresh: loadExperiments
  };
} 