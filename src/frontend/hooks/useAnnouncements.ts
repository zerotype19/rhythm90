import { useState, useEffect } from "react";

interface Announcement {
  id: string;
  title: string;
  message: string;
  link?: string;
  type: string;
  created_at: string;
}

export function useAnnouncements() {
  const [latestAnnouncement, setLatestAnnouncement] = useState<Announcement | null>(null);
  const [isRead, setIsRead] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestAnnouncement();
  }, []);

  const fetchLatestAnnouncement = async () => {
    try {
      const response = await fetch("/announcements/latest");
      const data = await response.json();
      if (data.success) {
        setLatestAnnouncement(data.announcement);
        setIsRead(data.read);
      }
    } catch (error) {
      console.error("Failed to fetch latest announcement:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (announcementId: string) => {
    setIsRead(true);
    // Update local state immediately for better UX
  };

  const hasUnreadAnnouncement = latestAnnouncement && !isRead;

  return {
    latestAnnouncement,
    isRead,
    loading,
    hasUnreadAnnouncement,
    markAsRead,
    refetch: fetchLatestAnnouncement,
  };
} 