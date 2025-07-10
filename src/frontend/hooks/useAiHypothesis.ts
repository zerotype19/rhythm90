import { useState } from "react";
import { fetchAiHypothesis } from "../utils/api";

export function useAiHypothesis() {
  const [hypothesis, setHypothesis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function getHypothesis(play_name: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAiHypothesis(play_name);
      setHypothesis(res.hypothesis);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { hypothesis, loading, error, getHypothesis };
} 