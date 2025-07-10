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

export async function fetchBoard(): Promise<{ results: Play[] }> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/board`);
  if (!res.ok) throw new Error("Failed to fetch board");
  return res.json();
}

export async function createPlay(play: Omit<Play, "id" | "created_at">) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/board`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(play),
  });
  if (!res.ok) throw new Error("Failed to create play");
  return res.json();
}

export async function fetchSignals(): Promise<{ results: Signal[] }> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/signals`);
  if (!res.ok) throw new Error("Failed to fetch signals");
  return res.json();
}

export async function createSignal(signal: Omit<Signal, "id" | "created_at">) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/signals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(signal),
  });
  if (!res.ok) throw new Error("Failed to create signal");
  return res.json();
}

export async function fetchAiSignal(observation: string): Promise<{ suggestion: string }> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/ai-signal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ observation }),
  });
  if (!res.ok) throw new Error("Failed to get AI signal suggestion");
  return res.json();
}

export async function fetchAiHypothesis(play_name: string): Promise<{ hypothesis: string }> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/ai-hypothesis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ play_name }),
  });
  if (!res.ok) throw new Error("Failed to get AI hypothesis");
  return res.json();
}

export const fetchTeamMembers = async (): Promise<any[]> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/team`);
  return response.json();
};

export const addTeamMember = async (user_id: string, role: string): Promise<any> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/team/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, role }),
  });
  return response.json();
};

export const removeTeamMember = async (user_id: string): Promise<any> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/team/remove`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id }),
  });
  return response.json();
};

export const fetchRnRSummary = async (): Promise<any> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/rnr-summary`);
  return response.json();
};

export const saveRnRSummary = async (summary: string): Promise<any> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/rnr-summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ summary }),
  });
  return response.json();
};

export const fetchDashboardStats = async (): Promise<any> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/dashboard-stats`);
  return response.json();
};

export const fetchNotifications = async (): Promise<any[]> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications`);
  return response.json();
}; 