import { useState, useEffect } from 'react';

interface FeatureFlags {
  [key: string]: boolean;
}

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeatureFlags();
  }, []);

  const loadFeatureFlags = async () => {
    try {
      const response = await fetch('/feature-flags');
      const data = await response.json();
      
      if (data.success) {
        setFlags(data.flags || {});
      }
    } catch (error) {
      console.error('Failed to load feature flags:', error);
    } finally {
      setLoading(false);
    }
  };

  const isFeatureEnabled = (flagName: string): boolean => {
    return flags[flagName] === true;
  };

  const hasAnyPremiumFeature = (): boolean => {
    const premiumFlags = [
      'ai_assistant_premium',
      'advanced_analytics',
      'priority_support'
    ];
    return premiumFlags.some(flag => flags[flag] === true);
  };

  return {
    flags,
    loading,
    isFeatureEnabled,
    hasAnyPremiumFeature,
    refresh: loadFeatureFlags
  };
} 