import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTeamModal({ isOpen, onClose, onSuccess }: CreateTeamModalProps) {
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName.trim()) {
      setError("Team name is required");
      return;
    }

    if (teamName.length < 3) {
      setError("Team name must be at least 3 characters");
      return;
    }

    if (teamName.length > 50) {
      setError("Team name must be less than 50 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name: teamName.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        setTeamName("");
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create team");
      }
    } catch (error) {
      console.error('Error creating team:', error);
      setError("Failed to create team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Create New Team</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="teamName" className="block text-sm font-medium mb-2">
                Team Name
              </label>
              <Input
                id="teamName"
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
                disabled={loading}
                className={error ? "border-red-500" : ""}
              />
              {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Between 3-50 characters
              </p>
            </div>
            
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
                disabled={loading || !teamName.trim()}
                className="flex-1"
              >
                {loading ? "Creating..." : "Create Team"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 