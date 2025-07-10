import { useEffect, useState } from "react";
import { fetchDashboardStats } from "../utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import Loading from "../components/Loading";
import OnboardingSidebar from "../components/OnboardingSidebar";
import AiAssistantPanel from "../components/AiAssistantPanel";

export default function Dashboard() {
  const [stats, setStats] = useState({ playCount: 0, signalCount: 0 });
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsData, userData] = await Promise.all([
          fetchDashboardStats(),
          fetch(`${import.meta.env.VITE_API_URL}/me`).then(res => res.json())
        ]);
        setStats(statsData);
        setUser(userData);
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
    <div className="max-w-6xl mx-auto p-8 space-y-6">
      <OnboardingSidebar />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-rhythmBlack dark:text-white">Dashboard</h1>
        {user?.is_premium && (
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            ⭐ Premium
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <p className="text-3xl font-bold text-rhythmBlack dark:text-white">{stats.playCount}</p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-lg hover:scale-[1.02]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Logged Signals</span>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-rhythmBlack dark:text-white">{stats.signalCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all hover:scale-105">
              <div className="text-2xl mb-2">📊</div>
              <p className="font-medium dark:text-white">View Plays</p>
            </div>
            <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all hover:scale-105">
              <div className="text-2xl mb-2">📝</div>
              <p className="font-medium dark:text-white">Log Signal</p>
            </div>
            <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all hover:scale-105">
              <div className="text-2xl mb-2">👥</div>
              <p className="font-medium dark:text-white">Team Settings</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Assistant Panel */}
      <div className="flex justify-center">
        <AiAssistantPanel />
      </div>
    </div>
  );
} 