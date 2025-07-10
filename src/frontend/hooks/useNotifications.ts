import { useEffect, useState, useCallback } from "react";
import { fetchNotifications } from "../utils/api";

interface Notification {
  id: string;
  title?: string;
  message: string;
  type?: string;
  priority?: string;
  action_url?: string;
  action_text?: string;
  is_read?: boolean;
  created_at: string;
  user_id?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { notifications, loading, refetch };
} 