import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../hooks/useAuth';
import * as Sentry from "@sentry/react";

// API helper functions
const api = {
  get: async (endpoint: string) => {
    const response = await fetch(`/api${endpoint}`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  },
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`/api${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  }
};

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  is_premium: boolean;
  is_active: boolean;
  created_at: string;
  play_count: number;
  signal_count: number;
  team_count: number;
}

interface Team {
  id: string;
  name: string;
  is_premium: boolean;
  is_active: boolean;
  created_at: string;
  play_count: number;
  signal_count: number;
  member_count: number;
  owner_name: string;
}

interface Play {
  id: string;
  name: string;
  target_outcome: string;
  is_archived: boolean;
  created_at: string;
  team_name: string;
  creator_name: string;
  signal_count: number;
}

interface Signal {
  id: string;
  observation: string;
  created_at: string;
  play_name: string;
  team_name: string;
  creator_name: string;
}

interface Analytics {
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

interface WebhookLog {
  id: string;
  event_type: string;
  event_id: string;
  webhook_url: string;
  status: string;
  response_code: number;
  error_message: string;
  retry_count: number;
  delivered_at: string;
  created_at: string;
}

interface WebhookStats {
  monthlyStats: Array<{
    date: string;
    event_type: string;
    status: string;
    count: number;
  }>;
  successRates: Array<{
    event_type: string;
    total: number;
    successful: number;
    success_rate: number;
  }>;
  pendingRetries: number;
}

interface SystemHealth {
  status: string;
  timestamp: string;
  checks: {
    database: { status: string; details: any };
    stripe: { status: string; details: any };
    webhooks: { status: string; details: any };
    users: { status: string; details: any };
  };
}

interface Feedback {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  category: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  assigned_to: string | null;
  assigned_to_name: string | null;
  created_at: string;
  updated_at: string;
}

interface DashboardMetrics {
  activeTeams: number;
  aiUsage: number;
  referralActivity: number;
  northStarMetric: number;
  dailyBreakdown: Array<{
    date: string;
    active_users: number;
    total_events: number;
  }>;
  timeFilter: string;
}

interface Experiment {
  id: string;
  name: string;
  description: string;
  variants: string[];
  is_active: boolean;
  start_date: string;
  end_date: string | null;
}

interface ExperimentStats {
  experiment_id: string;
  variant: string;
  user_count: number;
  conversion_rate: number;
  engagement_rate: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [plays, setPlays] = useState<Play[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [webhookStats, setWebhookStats] = useState<WebhookStats | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [experimentStats, setExperimentStats] = useState<ExperimentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    if (user?.role !== 'admin') {
      window.location.href = '/dashboard';
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, teamsRes, playsRes, signalsRes, analyticsRes, webhookLogsRes, webhookStatsRes, systemHealthRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/teams'),
        api.get('/admin/plays'),
        api.get('/admin/signals'),
        api.get('/analytics'),
        api.get('/admin/webhook-logs'),
        api.get('/admin/webhook-stats'),
        api.get('/system/health')
      ]);

      setUsers(usersRes.users || []);
      setTeams(teamsRes.teams || []);
      setPlays(playsRes.plays || []);
      setSignals(signalsRes.signals || []);
      setAnalytics(analyticsRes);
      setWebhookLogs(webhookLogsRes.logs || []);
      setWebhookStats(webhookStatsRes);
      setSystemHealth(systemHealthRes);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await api.post('/admin/users/toggle-status', { targetUserId: userId, isActive });
      await loadData();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const toggleTeamStatus = async (teamId: string, isActive: boolean) => {
    try {
      await api.post('/admin/teams/toggle-status', { teamId, isActive });
      await loadData();
    } catch (error) {
      console.error('Error toggling team status:', error);
    }
  };

  const togglePlayArchive = async (playId: string, isArchived: boolean) => {
    try {
      await api.post('/admin/plays/toggle-archive', { playId, isArchived });
      await loadData();
    } catch (error) {
      console.error('Error toggling play archive:', error);
    }
  };

  const deleteSignal = async (signalId: string) => {
    if (!confirm('Are you sure you want to delete this signal? This action cannot be undone.')) {
      return;
    }
    try {
      await api.post('/admin/signals/delete', { signalId });
      await loadData();
    } catch (error) {
      console.error('Error deleting signal:', error);
    }
  };

  const performBulkAction = async (action: string, targetType: string) => {
    if (selectedItems.length === 0) {
      alert('Please select items to perform bulk action');
      return;
    }

    if (!confirm(`Are you sure you want to ${action} ${selectedItems.length} ${targetType}?`)) {
      return;
    }

    try {
      await api.post('/admin/bulk-actions', {
        action,
        targetType,
        targetIds: selectedItems
      });
      setSelectedItems([]);
      await loadData();
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Admin control functions
  const setUserPremium = async (userId: string, isPremium: boolean) => {
    try {
      const endpoint = isPremium ? 'set-premium' : 'remove-premium';
      const response = await fetch(`/api/admin/users/${userId}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        await loadData(); // Refresh data
      } else {
        alert('Failed to update premium status');
      }
    } catch (error) {
      console.error('Error updating premium status:', error);
      alert('Error updating premium status');
    }
  };

  const setUserRole = async (userId: string, role: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${role}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/set-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      
      if (response.ok) {
        await loadData(); // Refresh data
      } else {
        alert('Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Error updating user role');
    }
  };

  const updateFeedbackStatus = async (feedbackId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/feedback/${feedbackId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        await loadData(); // Refresh data
      } else {
        alert('Failed to update feedback status');
      }
    } catch (error) {
      console.error('Error updating feedback status:', error);
      alert('Error updating feedback status');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users, teams, plays, and signals</p>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalPlays}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Signals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalSignals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalTeams}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-13">
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          <TabsTrigger value="teams">Teams ({teams.length})</TabsTrigger>
          <TabsTrigger value="plays">Plays ({plays.length})</TabsTrigger>
          <TabsTrigger value="signals">Signals ({signals.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks ({webhookLogs.length})</TabsTrigger>
          <TabsTrigger value="growth">Growth Toolkit</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="feedback">Feedback ({feedback.length})</TabsTrigger>
          <TabsTrigger value="experiments">Experiments</TabsTrigger>
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="social-drafts">Social Drafts</TabsTrigger>
          <TabsTrigger value="dashboard">Data & Signal Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Users</h2>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => performBulkAction('deactivate', 'users')}
                disabled={selectedItems.length === 0}
              >
                Deactivate Selected
              </Button>
              <Button
                variant="outline"
                onClick={() => performBulkAction('activate', 'users')}
                disabled={selectedItems.length === 0}
              >
                Activate Selected
              </Button>
            </div>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(users.map(u => u.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, user.id]);
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== user.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? 'default' : 'destructive'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_premium ? 'default' : 'outline'}>
                        {user.is_premium ? 'Premium' : 'Free'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{user.play_count} plays</div>
                        <div>{user.signal_count} signals</div>
                        <div>{user.team_count} teams</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleUserStatus(user.id, !user.is_active)}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUserPremium(user.id, !user.is_premium)}
                        >
                          {user.is_premium ? 'Remove Premium' : 'Set Premium'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUserRole(user.id, user.role === 'admin' ? 'user' : 'admin')}
                        >
                          {user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Teams</h2>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => performBulkAction('deactivate', 'teams')}
                disabled={selectedItems.length === 0}
              >
                Deactivate Selected
              </Button>
              <Button
                variant="outline"
                onClick={() => performBulkAction('activate', 'teams')}
                disabled={selectedItems.length === 0}
              >
                Activate Selected
              </Button>
            </div>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(teams.map(t => t.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(team.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, team.id]);
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== team.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{team.name}</TableCell>
                    <TableCell>{team.owner_name}</TableCell>
                    <TableCell>
                      <Badge variant={team.is_active ? 'default' : 'destructive'}>
                        {team.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={team.is_premium ? 'default' : 'outline'}>
                        {team.is_premium ? 'Premium' : 'Free'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{team.play_count} plays</div>
                        <div>{team.signal_count} signals</div>
                        <div>{team.member_count} members</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(team.created_at)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleTeamStatus(team.id, !team.is_active)}
                      >
                        {team.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="plays" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Plays</h2>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => performBulkAction('archive', 'plays')}
                disabled={selectedItems.length === 0}
              >
                Archive Selected
              </Button>
              <Button
                variant="outline"
                onClick={() => performBulkAction('unarchive', 'plays')}
                disabled={selectedItems.length === 0}
              >
                Unarchive Selected
              </Button>
            </div>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(plays.map(p => p.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Signals</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plays.map((play) => (
                  <TableRow key={play.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(play.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, play.id]);
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== play.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{play.name}</TableCell>
                    <TableCell>{play.team_name}</TableCell>
                    <TableCell>{play.creator_name}</TableCell>
                    <TableCell>
                      <Badge variant={play.is_archived ? 'secondary' : 'default'}>
                        {play.is_archived ? 'Archived' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell>{play.signal_count}</TableCell>
                    <TableCell>{formatDate(play.created_at)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePlayArchive(play.id, !play.is_archived)}
                      >
                        {play.is_archived ? 'Unarchive' : 'Archive'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="signals" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Signals</h2>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Observation</TableHead>
                  <TableHead>Play</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signals.map((signal) => (
                  <TableRow key={signal.id}>
                    <TableCell className="max-w-md truncate">{signal.observation}</TableCell>
                    <TableCell>{signal.play_name}</TableCell>
                    <TableCell>{signal.team_name}</TableCell>
                    <TableCell>{signal.creator_name}</TableCell>
                    <TableCell>{formatDate(signal.created_at)}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteSignal(signal.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-xl font-semibold">Top Teams</h2>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Play Count</TableHead>
                  <TableHead>Signal Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics?.topTeams.map((team, index) => (
                  <TableRow key={index}>
                    <TableCell>{team.name}</TableCell>
                    <TableCell>{team.play_count}</TableCell>
                    <TableCell>{team.signal_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Webhook Monitoring</h2>
            <div className="text-sm text-muted-foreground">
              {webhookStats?.pendingRetries || 0} pending retries
            </div>
          </div>

          {/* Webhook Statistics */}
          {webhookStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {webhookStats.successRates.map((rate) => (
                <Card key={rate.event_type}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{rate.event_type}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{rate.success_rate}%</div>
                    <p className="text-xs text-muted-foreground">
                      {rate.successful} / {rate.total} successful
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Webhook Logs Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response Code</TableHead>
                  <TableHead>Retry Count</TableHead>
                  <TableHead>Error Message</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhookLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="font-medium">{log.event_type}</div>
                      <div className="text-sm text-muted-foreground">{log.event_id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          log.status === 'delivered' ? 'default' : 
                          log.status === 'failed' ? 'destructive' : 
                          log.status === 'retrying' ? 'secondary' : 'outline'
                        }
                      >
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.response_code ? (
                        <Badge variant={log.response_code >= 400 ? 'destructive' : 'default'}>
                          {log.response_code}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{log.retry_count}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {log.error_message || '-'}
                    </TableCell>
                    <TableCell>{formatDate(log.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Growth Toolkit</h2>
            <Badge variant="secondary">Beta</Badge>
          </div>
          
          {/* Growth Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Referral Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Active codes</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Successful referrals</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Credits Generated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$0</div>
                <p className="text-xs text-muted-foreground">Total value</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Credit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$0</div>
                <p className="text-xs text-muted-foreground">Per referral</p>
              </CardContent>
            </Card>
          </div>

          {/* Referral Codes Management */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Referral Codes</CardTitle>
                <Button size="sm" onClick={() => alert('Create referral code functionality coming soon')}>
                  Create Code
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Uses</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No referral codes created yet
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Discount Credits Management */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Discount Credits</CardTitle>
                <Button size="sm" onClick={() => alert('Assign credit functionality coming soon')}>
                  Assign Credit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Referral Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No discount credits assigned yet
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Top Referrers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Referrers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Referrals</TableHead>
                    <TableHead>Total Credits</TableHead>
                    <TableHead>Avg per Referral</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No referral activity yet
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">System Health</h2>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  // Test Sentry error reporting
                  throw new Error('Test error from admin dashboard');
                }}
              >
                Test Sentry Error
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // Test Sentry performance monitoring
                  const transaction = Sentry.startTransaction({
                    name: 'Admin Dashboard Test Transaction',
                    op: 'test',
                  });
                  
                  setTimeout(() => {
                    transaction.finish();
                    alert('Sentry performance transaction completed');
                  }, 1000);
                }}
              >
                Test Sentry Performance
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadData}
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>

          {/* System Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Overall Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    systemHealth?.status === 'healthy' ? 'bg-green-500' : 
                    systemHealth?.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div className="text-lg font-bold capitalize">
                    {systemHealth?.status || 'Unknown'}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {systemHealth ? new Date(systemHealth.timestamp).toLocaleString() : 'Never'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Database</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    systemHealth?.checks.database.status === 'healthy' ? 'bg-green-500' : 
                    systemHealth?.checks.database.status === 'unhealthy' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></div>
                  <div className="text-lg font-bold capitalize">
                    {systemHealth?.checks.database.status || 'Unknown'}
                  </div>
                </div>
                {systemHealth?.checks.database.details && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {systemHealth.checks.database.details.userCount} users, {systemHealth.checks.database.details.teamCount} teams
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Stripe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    systemHealth?.checks.stripe.status === 'healthy' ? 'bg-green-500' : 
                    systemHealth?.checks.stripe.status === 'unhealthy' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></div>
                  <div className="text-lg font-bold capitalize">
                    {systemHealth?.checks.stripe.status || 'Unknown'}
                  </div>
                </div>
                {systemHealth?.checks.stripe.details && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {systemHealth.checks.stripe.details.chargesEnabled ? 'Charges enabled' : 'Charges disabled'}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Users (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemHealth?.checks.users.details?.activeUsers24h || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Unique logins
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Health Checks */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Health Checks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Database */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${
                      systemHealth?.checks.database.status === 'healthy' ? 'bg-green-500' : 
                      systemHealth?.checks.database.status === 'unhealthy' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                    <div>
                      <div className="font-medium">Database</div>
                      <div className="text-sm text-muted-foreground">
                        {systemHealth?.checks.database.status === 'healthy' ? 'Connection successful' : 
                         systemHealth?.checks.database.status === 'unhealthy' ? 'Connection failed' : 'Status unknown'}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {systemHealth?.checks.database.details ? 
                      `${systemHealth.checks.database.details.userCount} users, ${systemHealth.checks.database.details.teamCount} teams` : 
                      'No data'
                    }
                  </div>
                </div>

                {/* Stripe */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${
                      systemHealth?.checks.stripe.status === 'healthy' ? 'bg-green-500' : 
                      systemHealth?.checks.stripe.status === 'unhealthy' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                    <div>
                      <div className="font-medium">Stripe API</div>
                      <div className="text-sm text-muted-foreground">
                        {systemHealth?.checks.stripe.status === 'healthy' ? 'API connection successful' : 
                         systemHealth?.checks.stripe.status === 'unhealthy' ? 'API connection failed' : 'Status unknown'}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {systemHealth?.checks.stripe.details ? 
                      `Account: ${systemHealth.checks.stripe.details.accountId?.slice(0, 8)}...` : 
                      'No data'
                    }
                  </div>
                </div>

                {/* Webhooks */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${
                      systemHealth?.checks.webhooks.status === 'healthy' ? 'bg-green-500' : 
                      systemHealth?.checks.webhooks.status === 'unhealthy' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                    <div>
                      <div className="font-medium">Webhooks</div>
                      <div className="text-sm text-muted-foreground">
                        {systemHealth?.checks.webhooks.status === 'healthy' ? 'Webhook system operational' : 
                         systemHealth?.checks.webhooks.status === 'unhealthy' ? 'Webhook system issues' : 'Status unknown'}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {systemHealth?.checks.webhooks.details ? 
                      `${systemHealth.checks.webhooks.details.pendingCount} pending` : 
                      'No data'
                    }
                  </div>
                </div>

                {/* Users */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${
                      systemHealth?.checks.users.status === 'healthy' ? 'bg-green-500' : 
                      systemHealth?.checks.users.status === 'unhealthy' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                    <div>
                      <div className="font-medium">Active Users</div>
                      <div className="text-sm text-muted-foreground">
                        {systemHealth?.checks.users.status === 'healthy' ? 'User activity tracking operational' : 
                         systemHealth?.checks.users.status === 'unhealthy' ? 'User activity tracking issues' : 'Status unknown'}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {systemHealth?.checks.users.details ? 
                      `${systemHealth.checks.users.details.activeUsers24h} in last 24h` : 
                      'No data'
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Feedback Inbox</h2>
            <div className="flex space-x-2">
              <select 
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                onChange={(e) => {
                  // TODO: Add filtering by status
                }}
              >
                <option value="">All Status</option>
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
          
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedback.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{item.user_name || item.user_email || 'Anonymous'}</div>
                        {item.user_email && <div className="text-muted-foreground">{item.user_email}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        item.category === 'bug_report' ? 'destructive' :
                        item.category === 'feature_request' ? 'default' : 'secondary'
                      }>
                        {item.category.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {item.subject}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        item.status === 'new' ? 'default' :
                        item.status === 'in_progress' ? 'secondary' : 'outline'
                      }>
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        item.priority === 'critical' ? 'destructive' :
                        item.priority === 'high' ? 'default' :
                        item.priority === 'medium' ? 'secondary' : 'outline'
                      }>
                        {item.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(item.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <select
                          className="px-2 py-1 text-xs border border-input bg-background rounded"
                          value={item.status}
                          onChange={(e) => updateFeedbackStatus(item.id, e.target.value)}
                        >
                          <option value="new">New</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Add view details modal
                            alert(`Feedback: ${item.subject}\n\n${item.description}`);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="experiments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">A/B Experiments</h2>
            <Button
              variant="outline"
              onClick={() => {
                // TODO: Add create experiment modal
                alert('Create experiment functionality coming soon');
              }}
            >
              Create Experiment
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {experiments.map((experiment) => (
              <Card key={experiment.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {experiment.name}
                    <Badge variant={experiment.is_active ? 'default' : 'secondary'}>
                      {experiment.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{experiment.description}</p>
                  
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Variants:</span> {experiment.variants.join(', ')}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Start Date:</span> {formatDate(experiment.start_date)}
                    </div>
                    {experiment.end_date && (
                      <div className="text-sm">
                        <span className="font-medium">End Date:</span> {formatDate(experiment.end_date)}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // TODO: Add experiment stats modal
                        alert(`Experiment stats for ${experiment.name} coming soon`);
                      }}
                    >
                      View Stats
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit-logs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Audit Logs</h2>
            <Button
              variant="outline"
              onClick={() => {
                // TODO: Add export functionality
                alert('Export audit logs functionality coming soon');
              }}
            >
              Export CSV
            </Button>
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Action Type"
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            />
            <input
              type="text"
              placeholder="Admin User ID"
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            />
            <input
              type="text"
              placeholder="Target User ID"
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            />
            <input
              type="date"
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            />
            <input
              type="date"
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            />
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target User</TableHead>
                  <TableHead>Old Value</TableHead>
                  <TableHead>New Value</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Audit logs functionality coming soon
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="social-drafts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Social Media Drafts</h2>
            <Button
              variant="outline"
              onClick={() => {
                // TODO: Add create draft modal
                alert('Create social draft functionality coming soon');
              }}
            >
              Create Draft
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Twitter Launch
                  <Badge variant="outline">Draft</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  🚀 Just launched Rhythm90 - AI-powered product strategy insights! Turn observations into actionable insights with your team. Check it out: https://rhythm90.io #ProductStrategy #AI #Launch
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm">Schedule</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  LinkedIn Launch
                  <Badge variant="outline">Draft</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Excited to share Rhythm90, our new AI-powered platform that helps product teams turn observations into actionable insights. Built for collaboration and data-driven decision making. https://rhythm90.io
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm">Schedule</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Data & Signal Dashboard</h2>
            <div className="flex space-x-2">
              <select 
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                value={dashboardMetrics?.timeFilter || '7d'}
                onChange={(e) => {
                  // TODO: Load metrics with new time filter
                }}
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <Button
                variant="outline"
                onClick={() => {
                  const timeFilter = dashboardMetrics?.timeFilter || '7d';
                  window.open(`/api/admin/dashboard/export?timeFilter=${timeFilter}`, '_blank');
                }}
              >
                Export CSV
              </Button>
            </div>
          </div>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardMetrics?.activeTeams || 0}</div>
                <p className="text-xs text-muted-foreground">Teams with activity</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">AI Assistant Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardMetrics?.aiUsage || 0}</div>
                <p className="text-xs text-muted-foreground">AI interactions</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Referral Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardMetrics?.referralActivity || 0}</div>
                <p className="text-xs text-muted-foreground">Referral conversions</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">North Star Metric</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardMetrics?.northStarMetric || 0}</div>
                <p className="text-xs text-muted-foreground">Teams with &gt;1 play + signals</p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Breakdown Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dashboardMetrics?.dailyBreakdown.map((day) => (
                  <div key={day.date} className="flex items-center justify-between p-2 border rounded">
                    <div className="text-sm font-medium">{day.date}</div>
                    <div className="flex space-x-4 text-sm text-muted-foreground">
                      <span>{day.active_users} active users</span>
                      <span>{day.total_events} total events</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 