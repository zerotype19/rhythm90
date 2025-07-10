import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { useFeatureFlags } from "../hooks/useFeatureFlags";
import { updateTeamMemberRole, fetchTeamMembersWithRoles } from "../utils/api";
import AppLayout from "../components/AppLayout";
import Sidebar from "../components/Sidebar";

export default function Admin() {
  const [adminData, setAdminData] = useState<any>(null);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [removingUser, setRemovingUser] = useState<string | null>(null);
  const [customEndDate, setCustomEndDate] = useState('');
  const { flags: featureFlags, isFeatureEnabled } = useFeatureFlags();
  const [experimentMetrics, setExperimentMetrics] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    link: '',
    type: 'feature_update',
    active: true
  });
  const [showPreview, setShowPreview] = useState(false);

  const adminSidebarItems = [
    { to: "/admin", label: "Overview", icon: "📊" },
    { to: "/admin/invite", label: "Send Invites", icon: "📧" },
    { to: "/admin/teams", label: "Team Management", icon: "👥" },
    { to: "/admin/billing", label: "Billing", icon: "💳" },
    { to: "/admin/analytics", label: "Analytics", icon: "📈" },
  ];

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    async function fetchMetrics() {
      const res = await fetch("/experiments/metrics");
      const data = await res.json();
      if (data.success) setExperimentMetrics(data.metrics);
    }
    fetchMetrics();
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function load() {
    try {
      const [adminResult, statsResult] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/admin/teams`).then(res => res.json()),
        fetch(`${import.meta.env.VITE_API_URL}/admin/stats`).then(res => res.json())
      ]);
      
      setAdminData(adminResult);
      setAdminStats(statsResult);
    } catch (error) {
      console.error("Failed to load admin data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadAnnouncements() {
    try {
      const res = await fetch("/admin/announcements");
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.announcements || []);
      }
    } catch (error) {
      console.error("Failed to load announcements:", error);
    }
  }

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingAnnouncement && { id: editingAnnouncement.id }),
          ...announcementForm
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAnnouncementForm(false);
        setEditingAnnouncement(null);
        setAnnouncementForm({
          title: '',
          message: '',
          link: '',
          type: 'feature_update',
          active: true
        });
        loadAnnouncements();
      }
    } catch (error) {
      console.error("Failed to save announcement:", error);
    }
  };

  const handlePreview = async () => {
    try {
      const res = await fetch("/admin/announcements/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(announcementForm),
      });
      const data = await res.json();
      if (data.success) {
        setShowPreview(true);
      }
    } catch (error) {
      console.error("Failed to preview announcement:", error);
    }
  };

  const editAnnouncement = (announcement: any) => {
    setEditingAnnouncement(announcement);
    setAnnouncementForm({
      title: announcement.title,
      message: announcement.message,
      link: announcement.link || '',
      type: announcement.type,
      active: announcement.active
    });
    setShowAnnouncementForm(true);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "feature_update":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Feature Update</Badge>;
      case "bug_fix":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Bug Fix</Badge>;
      case "general_news":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">News</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  async function toggleFeatureFlag(key: string, currentValue: boolean) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/feature-flags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: "team-123", // Demo team
          flagName: key,
          isEnabled: !currentValue
        })
      });
      
      if (res.ok) {
        // Refresh the page to show updated flags
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to toggle feature flag:", error);
    }
  }

  if (loading) {
    return (
      <AppLayout maxWidth="7xl">
        <div className="text-center py-20">Loading admin data...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout maxWidth="7xl" className="py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64 lg:flex-shrink-0">
          <Sidebar items={adminSidebarItems} title="Admin" className="bg-card border rounded-lg" />
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <Link to="/admin/invite">
              <Button>Send Beta Invite</Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{adminData?.teams.length || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{adminStats?.totalUsers || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{adminStats?.activeUsers || 0}</p>
                <p className="text-sm text-muted-foreground">Last 7 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{adminStats?.conversionRate || "0%"}</p>
                <p className="text-sm text-muted-foreground">Free to Premium</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">MRR</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{adminStats?.mrr || "$0"}</p>
                <p className="text-sm text-muted-foreground">Monthly Recurring</p>
              </CardContent>
            </Card>
          </div>

          {/* Teams Management Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Team Management</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-card border border-border rounded-lg">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Team</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Members</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {adminData?.teams.map((team: any) => (
                    <tr key={team.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm text-foreground">{team.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{team.member_count}</td>
                      <td className="px-4 py-3">
                        <Badge variant={team.status === 'active' ? 'default' : 'secondary'}>
                          {team.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Feature Flags Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Feature Flags</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(featureFlags).map(([key, value]) => (
                <Card key={key}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">{key}</h3>
                        <p className="text-sm text-muted-foreground">Feature flag</p>
                      </div>
                      <Button
                        size="sm"
                        variant={value ? "default" : "outline"}
                        onClick={() => toggleFeatureFlag(key, value)}
                      >
                        {value ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Experiment Metrics Dashboard */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Experiment Metrics</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-card border border-border rounded-lg">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Experiment</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Variant</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Exposures</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Engagements</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Conversions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {experimentMetrics.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm text-foreground">{row.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{row.variant}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{row.exposures}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{row.engagements}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{row.conversions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Experiment Preview Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Experiment Variant Preview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {["A", "B", "C"].map((variant) => (
                <Card key={variant} className="p-4">
                  <h3 className="font-semibold mb-2 text-foreground">Landing CTA Variant {variant}</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-foreground">Headline: </span>
                      <span className="text-muted-foreground">
                        {variant === "B" ? "Ready to Supercharge Your Team?" : variant === "C" ? "Get Started with Rhythm90" : "Ready to Transform Your Marketing Operations?"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Primary Button: </span>
                      <span className="text-muted-foreground">
                        {variant === "C" ? "Get Started" : "Try Demo"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Secondary Button: </span>
                      <span className="text-muted-foreground">
                        {variant === "C" ? "Try Now" : "Learn More"}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Announcement Management Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-foreground">Feature Announcements</h2>
              <Button onClick={() => setShowAnnouncementForm(true)}>
                Create Announcement
              </Button>
            </div>

            {/* Announcement Form */}
            {showAnnouncementForm && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">
                  {editingAnnouncement ? 'Edit' : 'Create'} Announcement
                </h3>
                <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Title</label>
                    <Input
                      value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Announcement title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Message</label>
                    <textarea
                      value={announcementForm.message}
                      onChange={(e) => setAnnouncementForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Announcement message (supports simple HTML: <b>, <a>, etc.)"
                      className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                      rows={4}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Link (optional)</label>
                    <Input
                      value={announcementForm.link}
                      onChange={(e) => setAnnouncementForm(prev => ({ ...prev, link: e.target.value }))}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Type</label>
                    <select
                      value={announcementForm.type}
                      onChange={(e) => setAnnouncementForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="feature_update">Feature Update</option>
                      <option value="bug_fix">Bug Fix</option>
                      <option value="general_news">General News</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="active"
                      checked={announcementForm.active}
                      onChange={(e) => setAnnouncementForm(prev => ({ ...prev, active: e.target.checked }))}
                    />
                    <label htmlFor="active" className="text-sm text-foreground">Active (visible to users)</label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit">
                      {editingAnnouncement ? 'Update' : 'Create'}
                    </Button>
                    <Button type="button" variant="outline" onClick={handlePreview}>
                      Preview
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowAnnouncementForm(false);
                        setEditingAnnouncement(null);
                        setAnnouncementForm({
                          title: '',
                          message: '',
                          link: '',
                          type: 'feature_update',
                          active: true
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Announcements List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {announcements.map((announcement) => (
                <Card key={announcement.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-foreground">{announcement.title}</h3>
                        {getTypeBadge(announcement.type)}
                        {announcement.active && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {announcement.message.substring(0, 100)}...
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(announcement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editAnnouncement(announcement)}
                    >
                      Edit
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Preview Modal */}
          {showPreview && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Card className="max-w-md w-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Preview</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🎉</span>
                      <h3 className="font-semibold text-foreground">What's New</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTypeBadge(announcementForm.type)}
                      <span className="text-sm text-muted-foreground">Today</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-foreground">{announcementForm.title}</h4>
                      <div 
                        className="text-muted-foreground prose prose-sm"
                        dangerouslySetInnerHTML={{ 
                          __html: announcementForm.message.replace(/\n/g, '<br>') 
                        }}
                      />
                    </div>
                    {announcementForm.link && (
                      <div>
                        <a 
                          href={announcementForm.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                        >
                          Learn more →
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
} 