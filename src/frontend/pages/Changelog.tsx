import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { fetchChangelog } from "../utils/api";

interface ChangelogEntry {
  version: string;
  title: string;
  description: string;
  category: string;
  release_date: string;
  created_at: string;
}

export default function Changelog() {
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChangelog();
  }, []);

  async function loadChangelog() {
    try {
      const data = await fetchChangelog();
      setChangelog(data.changelog || []);
    } catch (error) {
      console.error("Failed to load changelog:", error);
      setError("Failed to load changelog");
    } finally {
      setLoading(false);
    }
  }

  function getCategoryBadge(category: string) {
    switch (category) {
      case "feature":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Feature</Badge>;
      case "improvement":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Improvement</Badge>;
      case "bug_fix":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Bug Fix</Badge>;
      default:
        return <Badge variant="secondary">{category}</Badge>;
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading changelog...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Changelog</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track the latest updates and improvements to Rhythm90
        </p>
      </div>

      <div className="space-y-6">
        {changelog.map((entry, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{entry.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                      v{entry.version}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(entry.release_date).toLocaleDateString()}
                    </span>
                    {getCategoryBadge(entry.category)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {entry.description && (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {entry.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {changelog.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No changelog entries found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 