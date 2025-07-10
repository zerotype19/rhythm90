import { useState } from "react";
import { createPlay } from "../utils/api";

export default function PlayCanvas() {
  const [form, setForm] = useState({ name: "", target_outcome: "", why_this_play: "", how_to_run: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPlay({ team_id: "team-123", ...form });
    alert("Play created!");
    setForm({ name: "", target_outcome: "", why_this_play: "", how_to_run: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input className="border p-2 w-full" placeholder="Play Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input className="border p-2 w-full" placeholder="Target Outcome" value={form.target_outcome} onChange={(e) => setForm({ ...form, target_outcome: e.target.value })} />
      <textarea className="border p-2 w-full" placeholder="Why This Play" value={form.why_this_play} onChange={(e) => setForm({ ...form, why_this_play: e.target.value })} />
      <textarea className="border p-2 w-full" placeholder="How to Run" value={form.how_to_run} onChange={(e) => setForm({ ...form, how_to_run: e.target.value })} />
      <button className="bg-rhythmRed text-white p-2 rounded" type="submit">Create Play</button>
    </form>
  );
} 