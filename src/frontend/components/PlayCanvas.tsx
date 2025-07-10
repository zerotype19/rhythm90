import { useState } from "react";
import { createPlay } from "../utils/api";
import { Button } from "./ui/button";

export default function PlayCanvas() {
  const [form, setForm] = useState({ name: "", target_outcome: "", why_this_play: "", how_to_run: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPlay({ 
      team_id: "team-123", 
      signals: "",
      status: "active",
      ...form 
    });
    alert("Play created!");
    setForm({ name: "", target_outcome: "", why_this_play: "", how_to_run: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input 
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rhythmRed" 
        placeholder="Play Name" 
        value={form.name} 
        onChange={(e) => setForm({ ...form, name: e.target.value })} 
      />
      <input 
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rhythmRed" 
        placeholder="Target Outcome" 
        value={form.target_outcome} 
        onChange={(e) => setForm({ ...form, target_outcome: e.target.value })} 
      />
      <textarea 
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rhythmRed" 
        placeholder="Why This Play" 
        value={form.why_this_play} 
        onChange={(e) => setForm({ ...form, why_this_play: e.target.value })} 
      />
      <textarea 
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rhythmRed" 
        placeholder="How to Run" 
        value={form.how_to_run} 
        onChange={(e) => setForm({ ...form, how_to_run: e.target.value })} 
      />
      <Button type="submit" className="w-full">Create Play</Button>
    </form>
  );
} 