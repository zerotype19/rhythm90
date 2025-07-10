import { useState } from "react";
import { useNotifications } from "../../hooks/useNotifications";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

export function NotificationDropdown() {
  const { notifications } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="w-9 h-9 relative transition-all hover:scale-105"
      >
        <BellIcon className="h-4 w-4" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-rhythmRed text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </Button>
      
      {open && (
        <div className="absolute right-0 mt-2 w-80 z-50">
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">No notifications</div>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id} className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <p className="text-sm text-gray-900 dark:text-gray-100">{notification.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <button className="text-sm text-rhythmRed hover:text-red-700 dark:text-rhythmRed dark:hover:text-red-400 w-full text-left transition-colors">
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