import { useEffect, useState } from "react";
import { fetchSignals, Signal } from "../utils/api";

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
      <ul>
        {signals.map((sig) => (
          <li key={sig.id} className="border p-2 mb-2 rounded">
            {sig.observation} → {sig.meaning}
          </li>
        ))}
      </ul>
    </div>
  );
} 