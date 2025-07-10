import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { useFeatureFlags } from "../hooks/useFeatureFlags";
import { trackEvent, AnalyticsEvents } from "../hooks/useAnalytics";
import { Link } from "react-router-dom";
import { fetchTeamMembersWithRoles, updateTeamMemberRole, removeTeamMemberFromTeam } from "../utils/api";
import { fetchSlackSettings } from "../utils/api";

interface Team {
  id: string;
  name: string;
  billing_status: string;
  stripe_customer_id?: string;
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

interface AdminData {
  teams: Team[];
  totalUsers: number;
  premiumUsers: number;
}

interface AdminStats {
  totalUsers: number;
  premiumUsers: number;
  activeUsers: number;
  conversionRate: string;
  mrr: string;
  lastUpdated: string;
}

interface AuditLogEntry {
  id: string;
  action_type: string;
  target_type: string;
  target_id: string;
  details: string;
  created_at: string;
  admin_name: string;
  admin_email: string;
}

export default function Admin() {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [invites, setInvites] = useState<InvitesData>({ activeInvites: [], expiredInvites: [], totalActive: 0, totalExpired: 0 });
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingFlags, setUpdatingFlags] = useState<string | null>(null);
  const [cancelingInvite, setCancelingInvite] = useState<string | null>(null);
  const [resendingInvite, setResendingInvite] = useState<string | null>(null);
  const [expiringInvite, setExpiringInvite] = useState<string | null>(null);
  const [invitingUser, setInvitingUser] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", role: "member" });
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string | null>(null);
  const featureFlags = useFeatureFlags();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      // Load admin data
      const adminRes = await fetch(`${import.meta.env.VITE_API_URL}/admin`);
      if (adminRes.ok) {
        const adminData = await adminRes.json();
        setAdminData(adminData);
      }

      // Load admin stats
      const statsRes = await fetch(`${import.meta.env.VITE_API_URL}/admin/stats`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setAdminStats(statsData);
      }

      // Load invites
      const invitesRes = await fetch(`${import.meta.env.VITE_API_URL}/admin/invites`);
      if (invitesRes.ok) {
        const invitesData = await invitesRes.json();
        setInvites(invitesData);
      }

      // Load audit log
      const auditRes = await fetch(`${import.meta.env.VITE_API_URL}/admin/audit-log`);
      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAuditLog(auditData.auditLog || []);
      }
    } catch (error) {
      console.error("Failed to load admin data:", error);
      setError("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }

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

  async function inviteUser(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteForm.email.trim() || !inviteForm.role) return;

    setInvitingUser(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/invite-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteForm),
      });

      if (!res.ok) {
        throw new Error("Failed to invite user");
      }

      const data = await res.json();
      if (data.success && data.inviteLink) {
        setGeneratedInviteLink(data.inviteLink);
        setInviteForm({ email: "", role: "member" });
        // Reload invites to show the new one
        const invitesRes = await fetch(`${import.meta.env.VITE_API_URL}/admin/invites`);
        if (invitesRes.ok) {
          const invitesData = await invitesRes.json();
          setInvites(invitesData);
        }
        // Reload audit log
        const auditRes = await fetch(`${import.meta.env.VITE_API_URL}/admin/audit-log`);
        if (auditRes.ok) {
          const auditData = await auditRes.json();
          setAuditLog(auditData.auditLog || []);
        }
      }
    } catch (error) {
      console.error("Failed to invite user:", error);
      alert("Failed to invite user. Please try again.");
    } finally {
      setInvitingUser(false);
    }
  }

  function copyInviteLink() {
    if (generatedInviteLink) {
      navigator.clipboard.writeText(generatedInviteLink);
      alert("Invite link copied to clipboard!");
      setGeneratedInviteLink(null);
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

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{adminData?.teams.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{adminStats?.totalUsers || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{adminStats?.activeUsers || 0}</p>
            <p className="text-sm text-gray-500">Last 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{adminStats?.conversionRate || "0%"}</p>
            <p className="text-sm text-gray-500">Free to Premium</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{adminStats?.mrr || "$0"}</p>
            <p className="text-sm text-gray-500">Monthly Recurring</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {adminData?.teams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {team.name}
                <Badge variant={team.billing_status === "active" ? "default" : "secondary"}>
                  {team.billing_status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Team ID: {team.id}
              </p>
              {team.stripe_customer_id && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Stripe: {team.stripe_customer_id}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

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

      {/* Invite User Form */}
      <Card>
        <CardHeader>
          <CardTitle>Invite New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={inviteUser} className="space-y-4">
            <div>
              <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <Input
                id="inviteEmail"
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="inviteRole" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role
              </label>
              <select
                id="inviteRole"
                value={inviteForm.role}
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="member">Member</option>
                <option value="analyst">Analyst</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <Button type="submit" disabled={invitingUser}>
              {invitingUser ? "Inviting..." : "Send Invite"}
            </Button>
            {generatedInviteLink && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-md">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Invite link: <span className="font-mono text-blue-600 dark:text-blue-400">{generatedInviteLink}</span>
                </p>
                <Button variant="outline" size="sm" onClick={copyInviteLink} className="mt-2">
                  Copy Link
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Audit Log Section */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Admin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLog.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{new Date(entry.created_at).toLocaleString()}</TableCell>
                    <TableCell>{entry.action_type}</TableCell>
                    <TableCell>{entry.target_type}</TableCell>
                    <TableCell>{entry.details}</TableCell>
                    <TableCell>{`${entry.admin_name} (${entry.admin_email})`}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Team Role Management Section */}
      <TeamRoleManagement />

      {/* Slack Integration Section */}
      <SlackIntegrationSection />
    </div>
  );
}

// Team Role Management Component
function TeamRoleManagement() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [removingUser, setRemovingUser] = useState<string | null>(null);

  useEffect(() => {
    loadTeamMembers();
  }, []);

  async function loadTeamMembers() {
    try {
      const data = await fetchTeamMembersWithRoles();
      setMembers(data.members || []);
    } catch (error) {
      console.error("Failed to load team members:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateRole(userId: string, newRole: string) {
    setUpdatingRole(userId);
    try {
      const result = await updateTeamMemberRole(userId, newRole);
      if (result.success) {
        // Update local state
        setMembers(prev => 
          prev.map(member => 
            member.user_id === userId 
              ? { ...member, role: newRole }
              : member
          )
        );
      } else {
        alert(result.message || "Failed to update role");
      }
    } catch (error) {
      console.error("Failed to update role:", error);
      alert("Failed to update role. Please try again.");
    } finally {
      setUpdatingRole(null);
    }
  }

  async function removeUser(userId: string) {
    if (!confirm("Are you sure you want to remove this user from the team?")) {
      return;
    }
    
    setRemovingUser(userId);
    try {
      const result = await removeTeamMemberFromTeam(userId);
      if (result.success) {
        // Remove from local state
        setMembers(prev => prev.filter(member => member.user_id !== userId));
      } else {
        alert(result.message || "Failed to remove user");
      }
    } catch (error) {
      console.error("Failed to remove user:", error);
      alert("Failed to remove user. Please try again.");
    } finally {
      setRemovingUser(null);
    }
  }

  function getRoleBadge(role: string) {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Admin</Badge>;
      case "analyst":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Analyst</Badge>;
      case "member":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Member</Badge>;
      case "viewer":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Viewer</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Role Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">Loading team members...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Role Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.user_id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{member.name}</h4>
                    {member.is_premium && (
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs">
                        Premium
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {getRoleBadge(member.role)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={member.role}
                    onChange={(e) => updateRole(member.user_id, e.target.value)}
                    disabled={updatingRole === member.user_id}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="member">Member</option>
                    <option value="analyst">Analyst</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeUser(member.user_id)}
                    disabled={removingUser === member.user_id}
                  >
                    {removingUser === member.user_id ? "Removing..." : "Remove"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {members.length === 0 && (
          <p className="text-gray-500 text-center py-4">No team members found.</p>
        )}
      </CardContent>
    </Card>
  );
}

// Slack Integration Section Component
function SlackIntegrationSection() {
  const [slackSettings, setSlackSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    loadSlackSettings();
  }, []);

  async function loadSlackSettings() {
    try {
      const data = await fetchSlackSettings();
      setSlackSettings(data);
    } catch (error) {
      console.error("Failed to load Slack settings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function reconnectSlack() {
    setReconnecting(true);
    try {
      // Placeholder action - would integrate with actual Slack OAuth
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert("Slack reconnection would be implemented here");
    } catch (error) {
      console.error("Failed to reconnect Slack:", error);
      alert("Failed to reconnect Slack. Please try again.");
    } finally {
      setReconnecting(false);
    }
  }

  async function disconnectSlack() {
    if (!confirm("Are you sure you want to disconnect Slack integration?")) {
      return;
    }
    
    setDisconnecting(true);
    try {
      // Placeholder action - would update database
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSlackSettings({ ...slackSettings, is_active: false });
      alert("Slack disconnected successfully");
    } catch (error) {
      console.error("Failed to disconnect Slack:", error);
      alert("Failed to disconnect Slack. Please try again.");
    } finally {
      setDisconnecting(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Slack Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">Loading Slack settings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          💬 Slack Integration
          <Badge variant={slackSettings?.is_active ? "default" : "secondary"}>
            {slackSettings?.is_active ? "Connected" : "Disconnected"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {slackSettings?.is_active ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Workspace</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {slackSettings.workspace_name || "Demo Workspace"}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Connected Channels</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {slackSettings.connected_channels || "All Channels"}
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Last Sync</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {slackSettings.last_sync ? new Date(slackSettings.last_sync).toLocaleString() : "Never"}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={reconnectSlack}
                disabled={reconnecting}
              >
                {reconnecting ? "Reconnecting..." : "Reconnect"}
              </Button>
              <Button
                variant="destructive"
                onClick={disconnectSlack}
                disabled={disconnecting}
              >
                {disconnecting ? "Disconnecting..." : "Disconnect"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Connect your Slack workspace to enable team collaboration and notifications.
            </p>
            <Button onClick={reconnectSlack} disabled={reconnecting}>
              {reconnecting ? "Connecting..." : "Connect Slack"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 