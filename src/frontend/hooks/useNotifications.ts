import { useEffect, useState } from "react";

interface Notification {
  id: string;
  message: string;
  created_at: string;
  user_id?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastCheck, setLastCheck] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications?since=${lastCheck}`);
        const data = await res.json();
        if (data.length > 0) {
          setNotifications((prev) => [...data, ...prev]);
        }
        setLastCheck(Date.now());
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [lastCheck]);

  return { notifications };
} 