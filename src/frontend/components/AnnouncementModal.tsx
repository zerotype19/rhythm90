import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface Announcement {
  id: string;
  title: string;
  message: string;
  link?: string;
  type: string;
  created_at: string;
}

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: Announcement | null;
  onMarkAsRead: (announcementId: string) => void;
}

export default function AnnouncementModal({ isOpen, onClose, announcement, onMarkAsRead }: AnnouncementModalProps) {
  const [isMarking, setIsMarking] = useState(false);

  const handleMarkAsRead = async () => {
    if (!announcement) return;
    setIsMarking(true);
    try {
      await fetch("/announcements/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId: announcement.id }),
      });
      onMarkAsRead(announcement.id);
      onClose();
    } catch (error) {
      console.error("Failed to mark announcement as read:", error);
    } finally {
      setIsMarking(false);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "feature_update":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Feature Update</Badge>;
      case "bug_fix":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Bug Fix</Badge>;
      case "general_news":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">News</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen || !announcement) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎉</span>
              <CardTitle className="text-lg">What's New</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500">
              ✕
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            {getTypeBadge(announcement.type)}
            <span className="text-sm text-gray-500">
              {formatDate(announcement.created_at)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">{announcement.title}</h3>
            <div 
              className="text-gray-700 dark:text-gray-300 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: announcement.message.replace(/\n/g, '<br>') 
              }}
            />
          </div>
          
          {announcement.link && (
            <div className="pt-2">
              <a 
                href={announcement.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
              >
                Learn more →
              </a>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button 
              onClick={handleMarkAsRead}
              disabled={isMarking}
            >
              {isMarking ? "Marking..." : "Got it!"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 