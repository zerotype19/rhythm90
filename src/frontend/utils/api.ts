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