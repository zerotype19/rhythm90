export interface Play {
  id: string;
  team_id: string;
  name: string;
  target_outcome: string;
  why_this_play: string;
  how_to_run: string;
  signals: string;
  status: string;
  created_at: string;
}

export interface Signal {
  id: string;
  play_id: string;
  observation: string;
  meaning: string;
  action: string;
  created_at: string;
}

function getApiBaseUrl() {
  return import.meta.env.VITE_API_URL?.replace(/\/$/, '');
}

export async function fetchBoard(): Promise<{ results: Play[] }> {
  const res = await fetch(`${getApiBaseUrl()}/board`);
  if (!res.ok) throw new Error("Failed to fetch board");
  return res.json();
}

export async function createPlay(play: Omit<Play, "id" | "created_at"> & { userId: string }) {
  console.log('[API] createPlay userId:', play.userId);
  const res = await fetch(`${getApiBaseUrl()}/board`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(play),
  });
  if (!res.ok) throw new Error("Failed to create play");
  return res.json();
}

export async function fetchSignals(): Promise<{ results: Signal[] }> {
  const res = await fetch(`${getApiBaseUrl()}/signals`);
  if (!res.ok) throw new Error("Failed to fetch signals");
  return res.json();
}

export async function createSignal(signal: Omit<Signal, "id" | "created_at"> & { userId: string }) {
  console.log('[API] createSignal userId:', signal.userId);
  const res = await fetch(`${getApiBaseUrl()}/signals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(signal),
  });
  if (!res.ok) throw new Error("Failed to create signal");
  return res.json();
}

export async function fetchAiSignal(observation: string): Promise<{ suggestion: string }> {
  const res = await fetch(`${getApiBaseUrl()}/ai-signal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ observation }),
  });
  if (!res.ok) throw new Error("Failed to get AI signal suggestion");
  return res.json();
}

export async function fetchAiHypothesis(play_name: string): Promise<{ hypothesis: string }> {
  const res = await fetch(`${getApiBaseUrl()}/ai-hypothesis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ play_name }),
  });
  if (!res.ok) throw new Error("Failed to get AI hypothesis");
  return res.json();
}

// Updated AI functions with new structured format
export async function getAiSignalHelp(params: {
  signal_text: string;
  play_name?: string;
  play_goal?: string;
  recent_signals?: string;
}): Promise<{ success: boolean; interpretation: string; suggestedAction: string }> {
  const res = await fetch(`${getApiBaseUrl()}/ai-signal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Failed to get AI signal help");
  return res.json();
}

export async function generateAiHypothesis(params: {
  play_description: string;
  goal: string;
}): Promise<{ success: boolean; hypothesis: string; expectedOutcome: string; risks: string }> {
  const res = await fetch(`${getApiBaseUrl()}/ai-hypothesis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Failed to generate AI hypothesis");
  return res.json();
}

// Templates
export async function fetchTemplates(): Promise<any> {
  const response = await fetch(`${getApiBaseUrl()}/templates`);
  return response.json();
}

// Slack integration
export async function fetchSlackSettings(): Promise<any> {
  const response = await fetch(`${getApiBaseUrl()}/slack/settings`);
  return response.json();
}

// Workshop
export async function fetchWorkshopStatus(): Promise<any> {
  const response = await fetch(`${getApiBaseUrl()}/workshop`);
  return response.json();
}

// Enhanced workshop functions
export async function fetchWorkshopSteps(): Promise<any> {
  const response = await fetch(`${getApiBaseUrl()}/workshop`);
  return response.json();
}

export async function updateWorkshopProgress(params: {
  step: string;
  status: string;
  data?: string;
}): Promise<any> {
  const response = await fetch(`${getApiBaseUrl()}/workshop/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return response.json();
}

// Analytics
export async function fetchAnalyticsOverview(dateRange: string = "30d"): Promise<any> {
  const response = await fetch(`${getApiBaseUrl()}/analytics/overview?range=${dateRange}`);
  return response.json();
}

// Enhanced notifications
export async function fetchNotifications(): Promise<any> {
  const response = await fetch(`${getApiBaseUrl()}/notifications`);
  return response.json();
}

export async function markNotificationRead(notificationId: string): Promise<any> {
  const response = await fetch(`${getApiBaseUrl()}/notifications/mark-read`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notification_id: notificationId }),
  });
  return response.json();
}

export async function sendNotification(params: {
  title: string;
  message: string;
  type?: string;
  priority?: string;
  action_url?: string;
  action_text?: string;
  user_id?: string;
  team_id?: string;
}): Promise<any> {
  const response = await fetch(`${getApiBaseUrl()}/notifications/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return response.json();
}

export const fetchTeamMembers = async (): Promise<any[]> => {
  const response = await fetch(`${getApiBaseUrl()}/admin/team`);
  return response.json();
};

export const addTeamMember = async (user_id: string, role: string): Promise<any> => {
  const response = await fetch(`${getApiBaseUrl()}/admin/team/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, role }),
  });
  return response.json();
};

export const removeTeamMember = async (user_id: string): Promise<any> => {
  const response = await fetch(`${getApiBaseUrl()}/admin/team/remove`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id }),
  });
  return response.json();
};

export const fetchRnRSummary = async (): Promise<any> => {
  const response = await fetch(`${getApiBaseUrl()}/rnr-summary`);
  return response.json();
};

export const saveRnRSummary = async (summary: string): Promise<any> => {
  const response = await fetch(`${getApiBaseUrl()}/rnr-summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ summary }),
  });
  return response.json();
};

// Comment out or remove fetchDashboardStats and fetchOnboardingStatus
// export const fetchDashboardStats = async (): Promise<any> => {
//   const response = await fetch(`${getApiBaseUrl()}/dashboard-stats`);
//   return response.json();
// };

// export const fetchOnboardingStatus = async (): Promise<any> => {
//   const response = await fetch(`${getApiBaseUrl()}/onboarding/status`);
//   return response.json();
// };

// Team role management
export const updateTeamMemberRole = async (user_id: string, new_role: string): Promise<any> => {
  const response = await fetch(`${getApiBaseUrl()}/admin/team/update-role`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, new_role }),
  });
  return response.json();
};

export const removeTeamMemberFromTeam = async (user_id: string): Promise<any> => {
  const response = await fetch(`${getApiBaseUrl()}/admin/team/remove-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id }),
  });
  return response.json();
};

export const fetchTeamMembersWithRoles = async (): Promise<any> => {
  const response = await fetch(`${getApiBaseUrl()}/admin/team/members`);
  return response.json();
};

// Admin dashboard stats
export const fetchAdminStats = async (): Promise<any> => {
  const response = await fetch(`${getApiBaseUrl()}/admin/stats`);
  return response.json();
};

// Public changelog
export const fetchChangelog = async (): Promise<any> => {
  const response = await fetch(`${getApiBaseUrl()}/changelog`);
  return response.json();
};

// User onboarding
export const completeOnboardingItem = async (item: string): Promise<any> => {
  const response = await fetch(`${getApiBaseUrl()}/onboarding/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item }),
  });
  return response.json();
}; 

// Workshop live collaboration
export async function updateWorkshopPresence(currentStep: string): Promise<any> {
  const response = await fetch(`${getApiBaseUrl()}/workshop/presence`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ current_step: currentStep }),
  });
  return response.json();
}

export async function fetchWorkshopPresence(): Promise<any> {
  const response = await fetch(`${getApiBaseUrl()}/workshop/presence`);
  return response.json();
}

export async function fetchWorkshopSync(since?: string): Promise<any> {
  const params = since ? `?since=${since}` : '';
  const response = await fetch(`${getApiBaseUrl()}/workshop/sync${params}`);
  return response.json();
}

// Premium analytics
export async function fetchPremiumAnalytics(dateRange: string = "30d"): Promise<any> {
  const response = await fetch(`${getApiBaseUrl()}/analytics/premium?range=${dateRange}`);
  return response.json();
}

// API key management
export async function fetchApiKeys(): Promise<any> {
  const response = await fetch(`${getApiBaseUrl()}/api/keys`);
  return response.json();
}

export async function createApiKey(name: string): Promise<any> {
  const response = await fetch(`${getApiBaseUrl()}/api/keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return response.json();
}

export async function revokeApiKey(keyId: string): Promise<any> {
  const response = await fetch(`${getApiBaseUrl()}/api/keys/revoke`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key_id: keyId }),
  });
  return response.json();
}

// Workshop notification settings
export async function fetchWorkshopNotificationSettings(): Promise<any> {
  const response = await fetch(`${getApiBaseUrl()}/workshop/notification-settings`);
  return response.json();
}

export async function updateWorkshopNotificationSettings(settings: {
  slack_enabled: boolean;
  notify_goals_completed: boolean;
  notify_plays_selected: boolean;
  notify_workshop_completed: boolean;
}): Promise<any> {
  const response = await fetch(`${getApiBaseUrl()}/workshop/notification-settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  return response.json();
}

// Admin export functions
export async function exportAuditLog(format: 'csv' | 'json', startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  params.append('format', format);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const response = await fetch(`${getApiBaseUrl()}/admin/export-audit-log?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to export audit log');
  }
  
  const blob = await response.blob();
  const filename = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || `audit-log-${new Date().toISOString().split('T')[0]}.${format}`;
  
  return { blob, filename };
}

export async function exportAnalytics(format: 'csv' | 'json', startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  params.append('format', format);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const response = await fetch(`${getApiBaseUrl()}/admin/export-analytics?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to export analytics');
  }
  
  const blob = await response.blob();
  const filename = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || `analytics-export-${new Date().toISOString().split('T')[0]}.${format}`;
  
  return { blob, filename };
} 

// Stripe events for admin
export async function fetchStripeEvents(): Promise<any> {
  const response = await fetch(`${getApiBaseUrl()}/admin/stripe-events`);
  return response.json();
} 