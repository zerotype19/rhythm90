import { useState, useEffect } from "react";
import { useNotifications } from "../../hooks/useNotifications";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { markNotificationRead } from "../../utils/api";

interface EnhancedNotification {
  id: string;
  title?: string;
  message: string;
  type?: string;
  priority?: string;
  action_url?: string;
  action_text?: string;
  is_read?: boolean;
  created_at: string;
}

export function NotificationDropdown() {
  const { notifications, refetch } = useNotifications();
  const [open, setOpen] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);

  // Start polling when dropdown is open
  useEffect(() => {
    if (open) {
      const interval = setInterval(() => {
        refetch();
      }, 30000); // 30 seconds
      setPollingInterval(interval);
    } else {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [open, refetch]);

  const handleMarkRead = async (notificationId: string) => {
    try {
      await markNotificationRead(notificationId);
      refetch();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleAction = (notification: EnhancedNotification) => {
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
    if (!notification.is_read) {
      handleMarkRead(notification.id);
    }
  };

  const getTypeBadge = (type?: string) => {
    switch (type) {
      case "success":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">Success</Badge>;
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs">Warning</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs">Error</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">Info</Badge>;
    }
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case "high":
        return "🔴";
      case "normal":
        return "🟡";
      case "low":
        return "🟢";
      default:
        return "🟡";
    }
  };

  const unreadCount = notifications.filter((n: EnhancedNotification) => !n.is_read).length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="w-9 h-9 relative transition-all hover:scale-105"
      >
        <BellIcon className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rhythmRed text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>
      
      {open && (
        <div className="absolute right-0 mt-2 w-96 z-50">
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                Notifications
                {pollingInterval && (
                  <span className="text-xs text-gray-500">Live</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">No notifications</div>
                ) : (
                  notifications.map((notification: EnhancedNotification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                        !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      onClick={() => handleAction(notification)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{getPriorityIcon(notification.priority)}</span>
                          {notification.title && (
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {notification.title}
                            </h4>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {getTypeBadge(notification.type)}
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                        {notification.action_text && (
                          <Button size="sm" variant="outline" className="text-xs">
                            {notification.action_text}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    className="text-sm text-rhythmRed hover:text-red-700 dark:text-rhythmRed dark:hover:text-red-400 w-full text-left transition-colors"
                    onClick={() => {
                      notifications.forEach((n: EnhancedNotification) => {
                        if (!n.is_read) {
                          handleMarkRead(n.id);
                        }
                      });
                    }}
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function BellIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
      />
    </svg>
  );
} 