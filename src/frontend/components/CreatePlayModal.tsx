import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface CreatePlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreatePlayModal({ isOpen, onClose, onSuccess }: CreatePlayModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    targetOutcome: "",
    whyThisPlay: "",
    howToRun: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Play name is required");
      return;
    }

    if (formData.name.length < 3) {
      setError("Play name must be at least 3 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/plays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: "",
          targetOutcome: "",
          whyThisPlay: "",
          howToRun: ""
        });
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create play");
      }
    } catch (error) {
      console.error('Error creating play:', error);
      setError("Failed to create play. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Create New Play</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Play Name *
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Increase Social Media Engagement"
                disabled={loading}
                className={error && !formData.name ? "border-red-500" : ""}
              />
              <p className="text-gray-500 text-xs mt-1">
                A clear, descriptive name for your marketing play
              </p>
            </div>

            <div>
              <label htmlFor="targetOutcome" className="block text-sm font-medium mb-2">
                Target Outcome
              </label>
              <Textarea
                id="targetOutcome"
                value={formData.targetOutcome}
                onChange={(e) => handleChange("targetOutcome", e.target.value)}
                placeholder="e.g., Increase social media engagement by 25% within 30 days"
                disabled={loading}
                rows={3}
              />
              <p className="text-gray-500 text-xs mt-1">
                What specific result are you aiming for?
              </p>
            </div>

            <div>
              <label htmlFor="whyThisPlay" className="block text-sm font-medium mb-2">
                Why This Play?
              </label>
              <Textarea
                id="whyThisPlay"
                value={formData.whyThisPlay}
                onChange={(e) => handleChange("whyThisPlay", e.target.value)}
                placeholder="e.g., Engagement has been declining and we need to re-engage our audience"
                disabled={loading}
                rows={3}
              />
              <p className="text-gray-500 text-xs mt-1">
                Why are you running this play? What's the context?
              </p>
            </div>

            <div>
              <label htmlFor="howToRun" className="block text-sm font-medium mb-2">
                How to Run
              </label>
              <Textarea
                id="howToRun"
                value={formData.howToRun}
                onChange={(e) => handleChange("howToRun", e.target.value)}
                placeholder="e.g., Focus on interactive content, community building, and responding to comments"
                disabled={loading}
                rows={3}
              />
              <p className="text-gray-500 text-xs mt-1">
                Brief description of how to execute this play
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}
            
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.name.trim()}
                className="flex-1"
              >
                {loading ? "Creating..." : "Create Play"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 