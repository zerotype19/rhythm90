import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { fetchAnalyticsOverview } from "../utils/api";

interface AnalyticsData {
  playsCreated: number;
  signalsLogged: number;
  aiUsageCount: number;
  mostActiveUser: {
    name: string;
    email: string;
    activityScore: number;
  } | null;
  dateRange: string;
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30d");

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const result = await fetchAnalyticsOverview(dateRange);
      setData(result);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  }

  function getDateRangeLabel(range: string): string {
    switch (range) {
      case "7d":
        return "Last 7 Days";
      case "30d":
        return "Last 30 Days";
      case "all":
        return "All Time";
      default:
        return "Last 30 Days";
    }
  }

  function getActivityLevel(score: number): { label: string; color: string } {
    if (score >= 20) return { label: "Very Active", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" };
    if (score >= 10) return { label: "Active", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" };
    if (score >= 5) return { label: "Moderate", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" };
    return { label: "Low", color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" };
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">📊 Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your team's activity and performance
          </p>
        </div>
        <div className="flex space-x-2">
          {["7d", "30d", "all"].map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(range)}
            >
              {getDateRangeLabel(range)}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plays Created</CardTitle>
            <Badge variant="secondary">{getDateRangeLabel(dateRange)}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.playsCreated || 0}</div>
            <p className="text-xs text-muted-foreground">
              Marketing plays created by your team
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signals Logged</CardTitle>
            <Badge variant="secondary">{getDateRangeLabel(dateRange)}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.signalsLogged || 0}</div>
            <p className="text-xs text-muted-foreground">
              Market signals captured and analyzed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Interactions</CardTitle>
            <Badge variant="secondary">{getDateRangeLabel(dateRange)}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.aiUsageCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              AI assistant interactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Most Active User */}
      {data?.mostActiveUser && (
        <Card>
          <CardHeader>
            <CardTitle>👑 Most Active Team Member</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{data.mostActiveUser.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{data.mostActiveUser.email}</p>
                <p className="text-sm text-gray-500">
                  Activity Score: {data.mostActiveUser.activityScore} points
                </p>
              </div>
              <Badge className={getActivityLevel(data.mostActiveUser.activityScore).color}>
                {getActivityLevel(data.mostActiveUser.activityScore).label}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📈 Activity Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Plays Created</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((data?.playsCreated || 0) * 10, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{data?.playsCreated || 0}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Signals Logged</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((data?.signalsLogged || 0) * 5, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{data?.signalsLogged || 0}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>AI Interactions</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((data?.aiUsageCount || 0) * 2, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{data?.aiUsageCount || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🎯 Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <p className="font-medium">Team Engagement</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {data?.mostActiveUser ? "High activity detected" : "Getting started"}
                  </p>
                </div>
                <Badge variant="secondary">
                  {data?.mostActiveUser ? "Active" : "New"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div>
                  <p className="font-medium">Signal Capture</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {data?.signalsLogged || 0} signals captured
                  </p>
                </div>
                <Badge variant="secondary">
                  {data?.signalsLogged || 0 > 0 ? "Tracking" : "Ready"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div>
                  <p className="font-medium">AI Utilization</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {data?.aiUsageCount || 0} AI interactions
                  </p>
                </div>
                <Badge variant="secondary">
                  {data?.aiUsageCount || 0 > 0 ? "Using AI" : "Available"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(!data?.playsCreated || data.playsCreated === 0) && (
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <span className="text-yellow-600">🎯</span>
                <div>
                  <p className="font-medium">Create Your First Play</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Start by creating a marketing play to track your strategy
                  </p>
                </div>
              </div>
            )}
            
            {(!data?.signalsLogged || data.signalsLogged === 0) && (
              <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-blue-600">📡</span>
                <div>
                  <p className="font-medium">Log Your First Signal</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Capture market signals to track changes and opportunities
                  </p>
                </div>
              </div>
            )}
            
            {(!data?.aiUsageCount || data.aiUsageCount === 0) && (
              <div className="flex items-start space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <span className="text-purple-600">🤖</span>
                <div>
                  <p className="font-medium">Try the AI Assistant</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use AI to analyze signals and get insights
                  </p>
                </div>
              </div>
            )}
            
            {data?.playsCreated && data.playsCreated > 0 && data.signalsLogged && data.signalsLogged > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-green-600">🚀</span>
                <div>
                  <p className="font-medium">Great Progress!</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You're actively using Rhythm90. Consider running a workshop to optimize your setup.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 