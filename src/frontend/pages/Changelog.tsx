import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

interface ChangelogEntry {
  id: string;
  title: string;
  description: string;
  category: 'New Feature' | 'Improvement' | 'Bug Fix' | 'Security';
  created_at: string;
}

export default function Changelog() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChangelog();
  }, []);

  async function loadChangelog() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/changelog/feed`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error("Failed to load changelog:", error);
    } finally {
      setLoading(false);
    }
  }

  function getCategoryIcon(category: string) {
    switch (category) {
      case 'New Feature':
        return '🚀';
      case 'Improvement':
        return '✨';
      case 'Bug Fix':
        return '🐛';
      case 'Security':
        return '🔒';
      default:
        return '📝';
    }
  }

  function getCategoryColor(category: string) {
    switch (category) {
      case 'New Feature':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Improvement':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Bug Fix':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Security':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading changelog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          What's New in Rhythm90
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Stay up to date with the latest features, improvements, and updates.
        </p>
      </div>

      {/* Changelog Entries */}
      <div className="space-y-6">
        {entries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No changelog entries available yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getCategoryIcon(entry.category)}</span>
                    <div>
                      <CardTitle className="text-lg">{entry.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getCategoryColor(entry.category)}>
                          {entry.category}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(entry.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {entry.description}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">
          Want to suggest a feature or report a bug?{' '}
          <button 
            onClick={() => window.location.href = '/marketing'}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
          >
            Get in touch
          </button>
        </p>
      </div>
    </div>
  );
} 