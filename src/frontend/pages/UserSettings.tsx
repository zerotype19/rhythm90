import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import PageLayout from "../components/PageLayout";
import Sidebar from "../components/Sidebar";

export default function UserSettings() {
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const settingsSidebarItems = [
    { to: "/settings", label: "Profile", icon: "👤" },
    { to: "/settings/notifications", label: "Notifications", icon: "🔔" },
    { to: "/settings/security", label: "Security", icon: "🔒" },
    { to: "/settings/billing", label: "Billing", icon: "💳" },
    { to: "/settings/preferences", label: "Preferences", icon: "⚙️" },
  ];

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/me`);
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  }

  async function save() {
    if (!user?.name.trim() || user.name.length < 2) {
      setError("Name must be at least 2 characters long");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: user.name }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
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

  function restartTour() {
    // Clear any stored tour state
    localStorage.removeItem("onboarding-completed");
    localStorage.removeItem("tour-step");
    window.location.reload();
  }

  if (!user) {
    return (
      <PageLayout maxWidth="4xl">
        <div className="text-center py-20">Loading user settings...</div>
      </PageLayout>
    );
  }

  const providerMap = {
    google: { name: "Google", icon: "🔍", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
    microsoft: { name: "Microsoft", icon: "🪟", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
    demo: { name: "Demo", icon: "🚀", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" }
  };

  const providerInfo = providerMap[user.provider as keyof typeof providerMap] || { name: "Unknown", icon: "❓", color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" };

  return (
    <PageLayout maxWidth="4xl" className="py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64 lg:flex-shrink-0">
          <Sidebar items={settingsSidebarItems} title="Settings" className="bg-card border rounded-lg" />
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <h1 className="text-3xl font-bold text-foreground">User Settings</h1>

          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <Input
                  value={user.email}
                  disabled
                  className="bg-muted text-muted-foreground"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Display Name
                </label>
                <Input
                  value={user.name}
                  onChange={(e) => setUser((prev: any) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your name"
                  maxLength={50}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  This name will be displayed to your team members.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Connected Account
                </label>
                <div className="flex items-center space-x-2">
                  <Badge className={providerInfo.color}>
                    {providerInfo.icon} {providerInfo.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    You can change this by logging out and signing in with a different account
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
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
                className="w-full sm:w-auto"
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
                <p className="text-muted-foreground">
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
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
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
                <p className="text-muted-foreground">
                  Unlock advanced features and unlimited access to Rhythm90.io
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-foreground">Advanced analytics dashboard</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-foreground">Unlimited plays and signals</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-foreground">AI assistant features</span>
                  </div>
                </div>
                <Button 
                  onClick={() => window.location.href = "/pricing"}
                  className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                >
                  View Pricing Plans
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Onboarding Tour Section */}
          <Card>
            <CardHeader>
              <CardTitle>Help & Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Need help getting started? Restart the onboarding tour to learn about key features.
              </p>
              <Button 
                onClick={restartTour}
                variant="outline"
                className="w-full sm:w-auto"
              >
                🎯 Restart Onboarding Tour
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
} 