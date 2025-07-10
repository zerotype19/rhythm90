import { useEffect, useState } from "react";
import { fetchSignals } from "../utils/api";
import type { Signal } from "../utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Loading from "./Loading";

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

  if (loading) return <Loading />;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-rhythmBlack dark:text-white">Signal Log</h2>
      <div className="space-y-3">
        {signals.length === 0 ? (
          <Card className="transition-all hover:shadow-lg">
            <CardContent className="p-6">
              <p className="text-gray-500 dark:text-gray-400 text-center">No signals found.</p>
            </CardContent>
          </Card>
        ) : (
          signals.map((sig) => (
            <Card key={sig.id} className="transition-all hover:shadow-lg hover:scale-[1.01]">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">{sig.observation}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">→ {sig.meaning}</p>
                    {sig.action && (
                      <p className="text-sm text-rhythmRed dark:text-rhythmRed font-medium">Action: {sig.action}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 