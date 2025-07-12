import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../hooks/useAuth';

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
      const [usersRes, teamsRes, playsRes, signalsRes, analyticsRes, webhookLogsRes, webhookStatsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/teams'),
        api.get('/admin/plays'),
        api.get('/admin/signals'),
        api.get('/analytics'),
        api.get('/admin/webhook-logs'),
        api.get('/admin/webhook-stats')
      ]);

      setUsers(usersRes.users || []);
      setTeams(teamsRes.teams || []);
      setPlays(playsRes.plays || []);
      setSignals(signalsRes.signals || []);
      setAnalytics(analyticsRes);
      setWebhookLogs(webhookLogsRes.logs || []);
      setWebhookStats(webhookStatsRes);
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
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          <TabsTrigger value="teams">Teams ({teams.length})</TabsTrigger>
          <TabsTrigger value="plays">Plays ({plays.length})</TabsTrigger>
          <TabsTrigger value="signals">Signals ({signals.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks ({webhookLogs.length})</TabsTrigger>
          <TabsTrigger value="growth">Growth Toolkit</TabsTrigger>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleUserStatus(user.id, !user.is_active)}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
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
      </Tabs>
    </div>
  );
} 