import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../hooks/useAuth';
import AppLayout from '../components/AppLayout';
import PremiumFeatureGuard from '../components/PremiumFeatureGuard';

interface AnalyticsData {
  activeUsers: number;
  totalPlays: number;
  totalSignals: number;
  totalTeams: number;
  topTeams: Array<{
    name: string;
    play_count: number;
    signal_count: number;
  }>;
}

export default function Analytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics', {
        credentials: 'include'
      });
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading analytics...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            {user?.role === 'admin' ? 'Global platform analytics' : 'Your team analytics'}
          </p>
        </div>

        {/* Analytics Overview Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {user?.role === 'admin' ? 'Active Users' : 'Team Members'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {user?.role === 'admin' ? 'Across all teams' : 'In your team'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalPlays}</div>
                <p className="text-xs text-muted-foreground">
                  {user?.role === 'admin' ? 'Across all teams' : 'In your team'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Signals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalSignals}</div>
                <p className="text-xs text-muted-foreground">
                  {user?.role === 'admin' ? 'Across all teams' : 'In your team'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {user?.role === 'admin' ? 'Total Teams' : 'Team Status'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalTeams}</div>
                <p className="text-xs text-muted-foreground">
                  {user?.role === 'admin' ? 'Active teams' : 'Active'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Premium Analytics Features */}
        <PremiumFeatureGuard feature="Advanced Analytics">
          <div className="space-y-6">
            {/* Top Teams (Admin only) */}
            {user?.role === 'admin' && analytics?.topTeams && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Teams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topTeams.map((team, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <div>
                            <div className="font-medium">{team.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {team.play_count} plays • {team.signal_count} signals
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {Math.round((team.play_count + team.signal_count) / 2)} avg
                          </div>
                          <div className="text-xs text-muted-foreground">engagement</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Advanced Charts Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📈</div>
                    <div className="text-muted-foreground">Interactive charts coming soon</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Track your team's performance over time
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Signal Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Signal Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🔍</div>
                    <div className="text-muted-foreground">Signal insights coming soon</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Understand patterns in your signal data
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </PremiumFeatureGuard>

        {/* Basic Analytics for Free Users */}
        {!user?.is_premium && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                Upgrade for Advanced Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Get detailed insights into your team's performance with advanced analytics features.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Free Plan Includes:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Basic usage statistics</li>
                    <li>• Team member count</li>
                    <li>• Play and signal totals</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Premium Analytics Include:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Interactive charts and trends</li>
                    <li>• Signal pattern analysis</li>
                    <li>• Performance benchmarking</li>
                    <li>• Export capabilities</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
} 