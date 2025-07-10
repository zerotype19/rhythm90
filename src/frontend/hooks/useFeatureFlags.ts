import { useEffect, useState } from "react";

interface FeatureFlags {
  aiAssistant: boolean;
  darkMode: boolean;
  notifications: boolean;
}

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>({
    aiAssistant: false,
    darkMode: false,
    notifications: false,
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/feature-flags`);
        const data = await res.json();
        setFlags(data);
      } catch (error) {
        console.error("Failed to fetch feature flags:", error);
      }
    }
    load();
  }, []);

  return flags;
} 