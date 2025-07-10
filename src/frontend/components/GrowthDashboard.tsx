import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface GrowthStats {
  referrals: {
    total: number;
    completed: number;
    pending: number;
  };
  experiments: {
    active: number;
    topVariants: Array<{
      variant: string;
      exposure_count: number;
      interaction_count: number;
      conversion_count: number;
    }>;
  };
}

export default function GrowthDashboard() {
  const [stats, setStats] = useState<GrowthStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGrowthStats();
  }, []);

  const loadGrowthStats = async () => {
    try {
      const response = await fetch('/growth/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load growth stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateConversionRate = (exposure: number, conversion: number): number => {
    if (exposure === 0) return 0;
    return Math.round((conversion / exposure) * 100);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">Loading growth statistics...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="text-center text-gray-500">No growth data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Referral Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Referrals</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.referrals.total}</p>
            </div>
            <div className="text-2xl">👥</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.referrals.completed}</p>
            </div>
            <div className="text-2xl">✅</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.referrals.pending}</p>
            </div>
            <div className="text-2xl">⏳</div>
          </div>
        </Card>
      </div>

      {/* Experiment Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Active Experiments
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-blue-600">{stats.experiments.active}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Currently running</p>
            </div>
            <div className="text-3xl">🧪</div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Performing Variants
          </h3>
          {stats.experiments.topVariants.length > 0 ? (
            <div className="space-y-3">
              {stats.experiments.topVariants.slice(0, 3).map((variant, index) => (
                <div key={variant.variant} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {variant.variant}
                    </Badge>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {calculateConversionRate(variant.exposure_count, variant.conversion_count)}% conversion
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {variant.conversion_count} conversions
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No experiment data available</p>
          )}
        </Card>
      </div>

      {/* Simple Chart Placeholder */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Referral Growth (Last 30 Days)
        </h3>
        <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📈</div>
            <p className="text-gray-600 dark:text-gray-400">
              Chart visualization coming soon
            </p>
            <p className="text-sm text-gray-500">
              {stats.referrals.total} total referrals in the last 30 days
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="text-2xl mb-2">🎯</div>
            <p className="font-medium text-gray-900 dark:text-white">Create Experiment</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Set up A/B test</p>
          </button>
          
          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="text-2xl mb-2">📊</div>
            <p className="font-medium text-gray-900 dark:text-white">View Analytics</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Detailed reports</p>
          </button>
          
          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="text-2xl mb-2">🔗</div>
            <p className="font-medium text-gray-900 dark:text-white">Manage Referrals</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Track rewards</p>
          </button>
        </div>
      </Card>
    </div>
  );
} 