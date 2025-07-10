import { useState } from "react";
import { fetchAiSignal } from "../utils/api";

export function useAiSignal() {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function getSuggestion(observation: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAiSignal(observation);
      setSuggestion(res.suggestion);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { suggestion, loading, error, getSuggestion };
} 