import { useEffect, useState } from "react";
import { fetchSignals } from "../utils/api";
import type { Signal } from "../utils/api";

export default function SignalLog() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSignals();
        setSignals(data.results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div>Loading Signals...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Signal Log</h2>
      <div className="space-y-3">
        {signals.map((sig) => (
          <div key={sig.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900 mb-1">{sig.observation}</p>
                <p className="text-sm text-gray-600 mb-2">→ {sig.meaning}</p>
                {sig.action && (
                  <p className="text-sm text-rhythmRed font-medium">Action: {sig.action}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 