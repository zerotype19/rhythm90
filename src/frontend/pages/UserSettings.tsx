import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { trackEvent, AnalyticsEvents } from "../hooks/useAnalytics";

interface User {
  id: string;
  name: string;
  email: string;
  provider: string;
  role: string;
  is_premium: boolean;
}

export default function UserSettings() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/me`);
        if (!res.ok) {
          throw new Error("Failed to load user data");
        }
        const data = await res.json();
        setUser(data);
      } catch (error) {
        setError("Failed to load user settings");
        console.error("Failed to load user:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function save() {
    if (!user) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: user.name }),
      });

      const data = await res.json();
      
      if (data.success) {
        setSuccess(true);
        trackEvent(AnalyticsEvents.SETTINGS_UPDATED, { field: "name" });
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const getProviderDisplay = (provider: string) => {
    switch (provider) {
      case "google":
        return { name: "Google", icon: "🔍", color: "bg-blue-100 text-blue-800" };
      case "microsoft":
        return { name: "Microsoft", icon: "🪟", color: "bg-green-100 text-green-800" };
      case "demo":
        return { name: "Demo", icon: "🎭", color: "bg-yellow-100 text-yellow-800" };
      case "invite":
        return { name: "Invited", icon: "📧", color: "bg-purple-100 text-purple-800" };
      default:
        return { name: provider, icon: "👤", color: "bg-gray-100 text-gray-800" };
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rhythmRed mx-auto mb-4"></div>
            <div className="text-gray-500">Loading user settings...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const providerInfo = getProviderDisplay(user.provider);

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-rhythmBlack dark:text-white">User Settings</h1>
        {user.is_premium && (
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            ⭐ Premium
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Display Name
            </label>
            <Input
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              placeholder="Enter your name"
              className="w-full"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              {user.name.length}/50 characters
            </p>
          </div>

          {/* Email Field (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <Input
              value={user.email}
              disabled
              className="w-full bg-gray-50 dark:bg-gray-800"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed (linked to {providerInfo.name} account)
            </p>
          </div>

          {/* OAuth Provider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Connected Account
            </label>
            <div className="flex items-center space-x-2">
              <Badge className={providerInfo.color}>
                {providerInfo.icon} {providerInfo.name}
              </Badge>
              <span className="text-sm text-gray-500">
                You can change this by logging out and signing in with a different account
              </span>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Account Role
            </label>
            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
              {user.role === "admin" ? "👑 Admin" : "👤 Member"}
            </Badge>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✅ Profile updated successfully!
              </p>
            </div>
          )}

          {/* Save Button */}
          <Button 
            onClick={save} 
            disabled={saving || !user.name.trim() || user.name.length < 2}
            className="w-full"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Billing Management Section (Admin Only) */}
      {user.role === "admin" && (
        <Card>
          <CardHeader>
            <CardTitle>Billing Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Manage team billing and subscriptions
            </p>
            <Button 
              onClick={async () => {
                try {
                  const res = await fetch(`${import.meta.env.VITE_API_URL}/create-customer-portal-session`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({}),
                  });
                  const data = await res.json();
                  if (data.success && data.portalUrl) {
                    window.location.href = data.portalUrl;
                  } else if (data.needsUpgrade) {
                    alert(data.message);
                    window.location.href = "/pricing";
                  } else {
                    alert("Failed to access billing portal");
                  }
                } catch (error) {
                  console.error("Billing error:", error);
                  alert("Failed to access billing");
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              💳 Manage Billing
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Premium Upgrade Section */}
      {!user.is_premium && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade to Premium</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Unlock advanced features and unlimited access to Rhythm90.io
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>Advanced analytics dashboard</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>Unlimited plays and signals</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>AI assistant features</span>
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = "/pricing"}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
            >
              View Pricing Plans
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 