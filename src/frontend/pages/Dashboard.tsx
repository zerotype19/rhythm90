import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import Loading from "../components/Loading";
import OnboardingSidebar from "../components/OnboardingSidebar";
import AiAssistantPanel from "../components/AiAssistantPanel";
import AppLayout from "../components/AppLayout";

export default function Dashboard() {
  const [stats, setStats] = useState({ playCount: 0, signalCount: 0 });
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Remove fetchDashboardStats since endpoint does not exist
        // const [statsData, userData] = await Promise.all([
        //   fetchDashboardStats(),
        //   fetch(`${import.meta.env.VITE_API_URL}/me`).then(res => res.json())
        // ]);
        // setStats(statsData);
        // setUser(userData);
        // Instead, just fetch user for now
        const userData = await fetch(`${import.meta.env.VITE_API_URL}/me`).then(res => res.json());
        setUser(userData);
        setStats({ playCount: 0, signalCount: 0 }); // Placeholder values
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Loading />;

  return (
    <AppLayout maxWidth="7xl" className="py-8">
      <OnboardingSidebar />
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        {user?.is_premium && (
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            ⭐ Premium
          </Badge>
        )}
      </div>
      
      {/* Stats Cards - Mobile responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="transition-all hover:shadow-lg hover:scale-[1.02]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Active Plays</span>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{stats.playCount}</p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-lg hover:scale-[1.02]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Signals Logged</span>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{stats.signalCount}</p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-lg hover:scale-[1.02] sm:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Team Activity</span>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">Active</p>
            <p className="text-sm text-muted-foreground">Team is engaged</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Mobile responsive grid */}
      <Card className="transition-all hover:shadow-lg mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-border rounded-lg hover:bg-muted cursor-pointer transition-all hover:scale-105">
              <div className="text-2xl mb-2">📊</div>
              <p className="font-medium text-foreground">View Plays</p>
            </div>
            <div className="text-center p-4 border border-border rounded-lg hover:bg-muted cursor-pointer transition-all hover:scale-105">
              <div className="text-2xl mb-2">📝</div>
              <p className="font-medium text-foreground">Log Signal</p>
            </div>
            <div className="text-center p-4 border border-border rounded-lg hover:bg-muted cursor-pointer transition-all hover:scale-105 sm:col-span-2 lg:col-span-1">
              <div className="text-2xl mb-2">👥</div>
              <p className="font-medium text-foreground">Team Settings</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Assistant Panel */}
      <div className="flex justify-center">
        <AiAssistantPanel />
      </div>
    </AppLayout>
  );
} 