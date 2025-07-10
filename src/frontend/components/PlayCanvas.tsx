import { useState } from "react";
import { createPlay } from "../utils/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

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
    <Card className="transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle>Create New Play</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Play Name
            </label>
            <Input
              placeholder="Enter play name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Outcome
            </label>
            <Input
              placeholder="What do you want to achieve?"
              value={form.target_outcome}
              onChange={(e) => setForm({ ...form, target_outcome: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Why This Play
            </label>
            <Textarea
              placeholder="Explain why this play is needed..."
              value={form.why_this_play}
              onChange={(e) => setForm({ ...form, why_this_play: e.target.value })}
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              How to Run
            </label>
            <Textarea
              placeholder="Describe how to execute this play..."
              value={form.how_to_run}
              onChange={(e) => setForm({ ...form, how_to_run: e.target.value })}
              rows={3}
            />
          </div>
          
          <Button type="submit" className="w-full transition-all hover:scale-105">
            Create Play
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 