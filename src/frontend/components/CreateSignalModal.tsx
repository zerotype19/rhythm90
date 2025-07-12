import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface Play {
  id: string;
  name: string;
}

interface CreateSignalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateSignalModal({ isOpen, onClose, onSuccess }: CreateSignalModalProps) {
  const [plays, setPlays] = useState<Play[]>([]);
  const [selectedPlayId, setSelectedPlayId] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchPlays();
    }
  }, [isOpen]);

  const fetchPlays = async () => {
    try {
      const response = await fetch('/api/plays', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlays(data.plays || []);
        if (data.plays && data.plays.length > 0) {
          setSelectedPlayId(data.plays[0].id);
        }
      } else {
        console.error('Failed to fetch plays');
      }
    } catch (error) {
      console.error('Error fetching plays:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlayId) {
      setError("Please select a play");
      return;
    }

    if (!description.trim()) {
      setError("Signal description is required");
      return;
    }

    if (description.length < 3) {
      setError("Signal description must be at least 3 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/signals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          playId: selectedPlayId,
          description: description.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setDescription("");
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create signal");
      }
    } catch (error) {
      console.error('Error creating signal:', error);
      setError("Failed to create signal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader>
          <CardTitle>Log New Signal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="play" className="block text-sm font-medium mb-2">
                Select Play *
              </label>
              <select
                id="play"
                value={selectedPlayId}
                onChange={(e) => setSelectedPlayId(e.target.value)}
                disabled={loading || plays.length === 0}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {plays.length === 0 ? (
                  <option value="">No plays available</option>
                ) : (
                  <>
                    <option value="">Select a play...</option>
                    {plays.map((play) => (
                      <option key={play.id} value={play.id}>
                        {play.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {plays.length === 0 && (
                <p className="text-orange-600 dark:text-orange-400 text-xs mt-1">
                  You need to create a play first before logging signals
                </p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Signal Description *
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., High email open rate on new campaign, suggesting strong subject line performance"
                disabled={loading}
                rows={4}
                className={error && !description ? "border-red-500" : ""}
              />
              <p className="text-gray-500 text-xs mt-1">
                Describe what you observed and what it might mean
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
                disabled={loading || !selectedPlayId || !description.trim()}
                className="flex-1"
              >
                {loading ? "Logging..." : "Log Signal"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 