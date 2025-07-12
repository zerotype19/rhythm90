import AdminDashboard from "./AdminDashboard";
import AppLayout from "../components/AppLayout";
import { useState, useEffect } from 'react';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [plays, setPlays] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({});
  const [experiments, setExperiments] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [socialDrafts, setSocialDrafts] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>({});
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [auditFilters, setAuditFilters] = useState({
    actionType: '',
    adminUserId: '',
    targetUserId: '',
    startDate: '',
    endDate: '',
    page: 1
  });
  const [auditPagination, setAuditPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  // Load experiments
  const loadExperiments = async () => {
    try {
      const response = await fetch('/api/admin/experiments');
      if (response.ok) {
        const data = await response.json();
        setExperiments(data.experiments || []);
      }
    } catch (error) {
      console.error('Error loading experiments:', error);
    }
  };

  // Load audit logs with filtering
  const loadAuditLogs = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(auditFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/admin/audit-logs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.logs || []);
        setAuditPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
    }
  };

  // Load feedback
  const loadFeedback = async () => {
    try {
      const response = await fetch('/api/admin/feedback');
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback || []);
      }
    } catch (error) {
      console.error('Error loading feedback:', error);
    }
  };

  // Load social drafts
  const loadSocialDrafts = async () => {
    try {
      const response = await fetch('/api/admin/social-drafts');
      if (response.ok) {
        const data = await response.json();
        setSocialDrafts(data.drafts || []);
      }
    } catch (error) {
      console.error('Error loading social drafts:', error);
    }
  };

  // Update experiment status
  const updateExperimentStatus = async (experimentId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/experiments/${experimentId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });
      if (response.ok) {
        loadExperiments();
      }
    } catch (error) {
      console.error('Error updating experiment status:', error);
    }
  };

  // Update experiment notes
  const updateExperimentNotes = async (experimentId: string, notes: string) => {
    try {
      const response = await fetch(`/api/admin/experiments/${experimentId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      if (response.ok) {
        loadExperiments();
      }
    } catch (error) {
      console.error('Error updating experiment notes:', error);
    }
  };

  // Update feedback public status
  const updateFeedbackPublic = async (feedbackId: string, isPublic: boolean) => {
    try {
      const response = await fetch(`/api/admin/feedback/${feedbackId}/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic })
      });
      if (response.ok) {
        loadFeedback();
      }
    } catch (error) {
      console.error('Error updating feedback public status:', error);
    }
  };

  // Update feedback comment
  const updateFeedbackComment = async (feedbackId: string, comment: string) => {
    try {
      const response = await fetch(`/api/admin/feedback/${feedbackId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment })
      });
      if (response.ok) {
        loadFeedback();
      }
    } catch (error) {
      console.error('Error updating feedback comment:', error);
    }
  };

  // Export audit logs
  const exportAuditLogs = () => {
    const params = new URLSearchParams();
    Object.entries(auditFilters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    window.open(`/api/admin/audit-logs/export?${params}`, '_blank');
  };

  useEffect(() => {
    if (activeTab === 'experiments') {
      loadExperiments();
    } else if (activeTab === 'audit-logs') {
      loadAuditLogs();
    } else if (activeTab === 'feedback') {
      loadFeedback();
    } else if (activeTab === 'social-drafts') {
      loadSocialDrafts();
    }
  }, [activeTab, auditFilters]);

  const tabs = [
    { id: 'users', label: 'Users' },
    { id: 'teams', label: 'Teams' },
    { id: 'plays', label: 'Plays' },
    { id: 'signals', label: 'Signals' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'experiments', label: 'Experiments' },
    { id: 'audit-logs', label: 'Audit Logs' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'social-drafts', label: 'Social Drafts' },
    { id: 'system-health', label: 'System Health' }
  ];

  return (
    <AppLayout maxWidth="7xl">
      <AdminDashboard />
    </AppLayout>
  );
} 