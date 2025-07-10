import { useEffect, useState } from "react";

export function useExperiment(experimentId: string) {
  const [variant, setVariant] = useState<string | null>(null);

  useEffect(() => {
    async function assign() {
      const res = await fetch("/experiments/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experimentId }),
      });
      const data = await res.json();
      if (data.success) setVariant(data.variant);
    }
    if (experimentId) assign();
  }, [experimentId]);

  function logEvent(eventType: "exposure" | "interaction" | "conversion", eventData?: any) {
    if (!variant) return;
    fetch("/experiments/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ experimentId, variant, eventType, eventData }),
    });
  }

  return { variant, logEvent };
} 