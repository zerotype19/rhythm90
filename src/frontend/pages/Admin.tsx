import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { useFeatureFlags } from "../hooks/useFeatureFlags";
import { trackEvent, AnalyticsEvents } from "../hooks/useAnalytics";

interface Team {
  id: string;
  name: string;
  created_at: string;
}

interface AdminData {
  teams: Team[];
  teamCount: number;
}

export default function Admin() {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingFlags, setUpdatingFlags] = useState<string | null>(null);
  const featureFlags = useFeatureFlags();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/teams`);
        if (!res.ok) {
          throw new Error("Access denied. Admin privileges required.");
        }
        const data = await res.json();
        setAdminData(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function toggleFeatureFlag(key: string, currentValue: boolean) {
    setUpdatingFlags(key);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/feature-flags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, enabled: !currentValue }),
      });

      if (!res.ok) {
        throw new Error("Failed to update feature flag");
      }

      // Track the feature flag toggle event
      trackEvent(AnalyticsEvents.FEATURE_TOGGLED, { 
        feature: key, 
        newValue: !currentValue 
      });

      // Refresh the page to show updated flags
      window.location.reload();
    } catch (error) {
      console.error("Failed to toggle feature flag:", error);
      alert("Failed to update feature flag. Please try again.");
    } finally {
      setUpdatingFlags(null);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading admin dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error}</p>
            <Link to="/" className="inline-block mt-4">
              <Button>Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link to="/admin/invite">
          <Button>Send Beta Invite</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Teams Section */}
        <Card>
          <CardHeader>
            <CardTitle>Beta Teams ({adminData?.teamCount || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {!adminData?.teams || adminData.teams.length === 0 ? (
              <p className="text-gray-500">No teams found.</p>
            ) : (
              <div className="space-y-3">
                {adminData.teams.map((team) => (
                  <div key={team.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{team.name}</h3>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(team.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">ID: {team.id}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feature Flags Section */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(featureFlags).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                    <p className="text-sm text-gray-500">
                      {enabled ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                  <Button
                    variant={enabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleFeatureFlag(key, enabled)}
                    disabled={updatingFlags === key}
                  >
                    {updatingFlags === key ? "Updating..." : enabled ? "Disable" : "Enable"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 