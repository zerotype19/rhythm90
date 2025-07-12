import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../hooks/useAuth';
import AppLayout from '../components/AppLayout';
import PremiumFeatureGuard from '../components/PremiumFeatureGuard';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

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
  timeSeriesData: {
    dailyUsers: Array<{
      date: string;
      user_count: number;
    }>;
    dailyPlays: Array<{
      date: string;
      play_count: number;
    }>;
    dailySignals: Array<{
      date: string;
      signal_count: number;
    }>;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Analytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`, {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">
              {user?.role === 'admin' ? 'Global platform analytics' : 'Your team analytics'}
            </p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
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
            {/* Time Series Charts */}
            {analytics?.timeSeriesData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Activity Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics.timeSeriesData.dailyPlays}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={formatDate}
                          fontSize={12}
                        />
                        <YAxis fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="play_count" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          name="Plays"
                        />
                        {analytics.timeSeriesData.dailySignals.map((signal, index) => (
                          <Line 
                            key={index}
                            type="monotone" 
                            dataKey="signal_count" 
                            stroke="#82ca9d" 
                            strokeWidth={2}
                            name="Signals"
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* User Activity Chart (Admin only) */}
                {user?.role === 'admin' && analytics.timeSeriesData.dailyUsers && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Active Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.timeSeriesData.dailyUsers}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={formatDate}
                            fontSize={12}
                          />
                          <YAxis fontSize={12} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line 
                            type="monotone" 
                            dataKey="user_count" 
                            stroke="#ff7300" 
                            strokeWidth={2}
                            name="Active Users"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Top Teams Chart (Admin only) */}
            {user?.role === 'admin' && analytics?.topTeams && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Teams</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analytics.topTeams}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="play_count" fill="#8884d8" name="Plays" />
                      <Bar dataKey="signal_count" fill="#82ca9d" name="Signals" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Team Performance Distribution */}
            {user?.role === 'admin' && analytics?.topTeams && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Plays Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                                                 <Pie
                           data={analytics.topTeams}
                           cx="50%"
                           cy="50%"
                           labelLine={false}
                           label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                           outerRadius={80}
                           fill="#8884d8"
                           dataKey="play_count"
                         >
                          {analytics.topTeams.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Signals Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                                                 <Pie
                           data={analytics.topTeams}
                           cx="50%"
                           cy="50%"
                           labelLine={false}
                           label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                           outerRadius={80}
                           fill="#82ca9d"
                           dataKey="signal_count"
                         >
                          {analytics.topTeams.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Top Teams List (Admin only) */}
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
                Get access to interactive charts, time-series data, and detailed insights to track your team's performance over time.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Interactive charts and graphs
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Time-series data analysis
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Performance trends
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
} 