import { useState } from "react";
import { createPlay } from "../utils/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { trackEvent, AnalyticsEvents } from "../hooks/useAnalytics";
import TemplatesPanel from "./TemplatesPanel";

export default function PlayCanvas() {
  const [form, setForm] = useState({ name: "", target_outcome: "", why_this_play: "", how_to_run: "" });
  const [activeTab, setActiveTab] = useState<"create" | "templates">("create");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPlay({ 
        team_id: "team-123", 
        signals: "",
        status: "active",
        ...form 
      });
      
      // Track the play creation event
      trackEvent(AnalyticsEvents.PLAY_CREATED, { 
        playName: form.name,
        targetOutcome: form.target_outcome 
      });
      
      alert("Play created!");
      setForm({ name: "", target_outcome: "", why_this_play: "", how_to_run: "" });
    } catch (error) {
      console.error("Failed to create play:", error);
      alert("Failed to create play. Please try again.");
    }
  };

  const handleApplyTemplate = (templateData: any) => {
    setForm({
      name: templateData.name || "",
      target_outcome: templateData.target_outcome || "",
      why_this_play: templateData.why_this_play || "",
      how_to_run: templateData.how_to_run || ""
    });
    setActiveTab("create");
  };

  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle>Create New Play</CardTitle>
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("create")}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === "create"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Create Play
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === "templates"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Templates
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === "create" ? (
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
        ) : (
          <TemplatesPanel onApplyTemplate={handleApplyTemplate} />
        )}
      </CardContent>
    </Card>
  );
} 