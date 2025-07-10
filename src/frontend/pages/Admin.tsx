import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { useFeatureFlags } from "../hooks/useFeatureFlags";
import { trackEvent, AnalyticsEvents } from "../hooks/useAnalytics";
import { Badge } from "../components/ui/badge";

interface Team {
  id: string;
  name: string;
  created_at: string;
}

interface AdminData {
  teams: Team[];
  teamCount: number;
}

interface Invite {
  id: string;
  email: string;
  created_at: string;
  expires_at: string;
  invited_by_name?: string;
}

interface InvitesData {
  activeInvites: Invite[];
  expiredInvites: Invite[];
  totalActive: number;
  totalExpired: number;
}

export default function Admin() {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [invites, setInvites] = useState<InvitesData>({ activeInvites: [], expiredInvites: [], totalActive: 0, totalExpired: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingFlags, setUpdatingFlags] = useState<string | null>(null);
  const [cancelingInvite, setCancelingInvite] = useState<string | null>(null);
  const [resendingInvite, setResendingInvite] = useState<string | null>(null);
  const [expiringInvite, setExpiringInvite] = useState<string | null>(null);
  const featureFlags = useFeatureFlags();

  useEffect(() => {
    async function load() {
      try {
        const [teamsRes, invitesRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/admin/teams`),
          fetch(`${import.meta.env.VITE_API_URL}/admin/invites`)
        ]);
        
        if (!teamsRes.ok) {
          throw new Error("Access denied. Admin privileges required.");
        }
        
        const teamsData = await teamsRes.json();
        setAdminData(teamsData);
        
        if (invitesRes.ok) {
          const invitesData = await invitesRes.json();
          setInvites(invitesData);
        }
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

  async function cancelInvite(inviteId: string) {
    setCancelingInvite(inviteId);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/invites/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite_id: inviteId }),
      });

      if (!res.ok) {
        throw new Error("Failed to cancel invite");
      }

      // Remove invite from state
      setInvites(prev => ({
        ...prev,
        activeInvites: prev.activeInvites.filter(invite => invite.id !== inviteId),
        totalActive: prev.totalActive - 1
      }));
    } catch (error) {
      console.error("Failed to cancel invite:", error);
      alert("Failed to cancel invite. Please try again.");
    } finally {
      setCancelingInvite(null);
    }
  }

  async function resendInvite(inviteId: string) {
    setResendingInvite(inviteId);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/invites/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite_id: inviteId }),
      });

      if (!res.ok) {
        throw new Error("Failed to resend invite");
      }

      const data = await res.json();
      if (data.success && data.inviteLink) {
        // Copy link to clipboard
        navigator.clipboard.writeText(data.inviteLink);
        alert("New invite link copied to clipboard!");
      }
    } catch (error) {
      console.error("Failed to resend invite:", error);
      alert("Failed to resend invite. Please try again.");
    } finally {
      setResendingInvite(null);
    }
  }

  async function expireInvite(inviteId: string) {
    setExpiringInvite(inviteId);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/invites/expire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite_id: inviteId }),
      });

      if (!res.ok) {
        throw new Error("Failed to expire invite");
      }

      // Move invite from active to expired
      const inviteToMove = invites.activeInvites.find(invite => invite.id === inviteId);
      if (inviteToMove) {
        setInvites(prev => ({
          ...prev,
          activeInvites: prev.activeInvites.filter(invite => invite.id !== inviteId),
          expiredInvites: [inviteToMove, ...prev.expiredInvites],
          totalActive: prev.totalActive - 1,
          totalExpired: prev.totalExpired + 1
        }));
      }
    } catch (error) {
      console.error("Failed to expire invite:", error);
      alert("Failed to expire invite. Please try again.");
    } finally {
      setExpiringInvite(null);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Pending Invites Section */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Invites ({invites.activeInvites.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {invites.activeInvites.length === 0 ? (
              <p className="text-gray-500">No pending invites.</p>
            ) : (
              <div className="space-y-3">
                {invites.activeInvites.map((invite) => (
                  <div key={invite.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{invite.email}</h3>
                        <p className="text-sm text-gray-500">
                          Invited: {new Date(invite.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Expires: {new Date(invite.expires_at).toLocaleDateString()}
                        </p>
                        {invite.invited_by_name && (
                          <p className="text-xs text-gray-400">
                            By: {invite.invited_by_name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => cancelInvite(invite.id)}
                          disabled={cancelingInvite === invite.id}
                        >
                          {cancelingInvite === invite.id ? "Canceling..." : "Cancel"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resendInvite(invite.id)}
                          disabled={resendingInvite === invite.id}
                        >
                          {resendingInvite === invite.id ? "Resending..." : "Resend"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => expireInvite(invite.id)}
                          disabled={expiringInvite === invite.id}
                        >
                          {expiringInvite === invite.id ? "Expiring..." : "Expire"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expired Invites Section */}
        {invites.expiredInvites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Expired Invites ({invites.expiredInvites.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invites.expiredInvites.map((invite) => (
                  <div key={invite.id} className="border rounded-lg p-4 bg-gray-100 dark:bg-gray-900 opacity-75">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-600 dark:text-gray-400">{invite.email}</h3>
                        <p className="text-sm text-gray-500">
                          Invited: {new Date(invite.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Expired: {new Date(invite.expires_at).toLocaleDateString()}
                        </p>
                        {invite.invited_by_name && (
                          <p className="text-xs text-gray-400">
                            By: {invite.invited_by_name}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Expired
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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