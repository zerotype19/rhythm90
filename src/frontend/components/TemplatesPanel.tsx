import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { fetchTemplates } from "../utils/api";

interface Template {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
}

interface PlayData {
  name: string;
  target_outcome: string;
  why_this_play: string;
  how_to_run: string;
  signals?: Array<{
    observation: string;
    meaning: string;
    action: string;
  }>;
}

export default function TemplatesPanel({ onApplyTemplate }: { onApplyTemplate: (data: PlayData) => void }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [applyingTemplate, setApplyingTemplate] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      const data = await fetchTemplates();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error("Failed to load templates:", error);
    } finally {
      setLoading(false);
    }
  }

  function applyTemplate(template: Template) {
    setApplyingTemplate(template.id);
    try {
      const content = JSON.parse(template.content) as PlayData;
      onApplyTemplate(content);
    } catch (error) {
      console.error("Failed to parse template content:", error);
    } finally {
      setApplyingTemplate(null);
    }
  }

  function getCategoryBadge(category: string) {
    switch (category) {
      case "engagement":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Engagement</Badge>;
      case "conversion":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Conversion</Badge>;
      case "retention":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Retention</Badge>;
      case "awareness":
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Awareness</Badge>;
      default:
        return <Badge variant="secondary">{category}</Badge>;
    }
  }

  const categories = ["all", "engagement", "conversion", "retention", "awareness"];
  const filteredTemplates = selectedCategory === "all" 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading templates...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📋 Play Templates
          <Badge variant="secondary">{templates.length} available</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {category === "all" ? "All" : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {template.title}
                </h4>
                {getCategoryBadge(template.category)}
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {template.description}
              </p>
              
              <Button
                size="sm"
                onClick={() => applyTemplate(template)}
                disabled={applyingTemplate === template.id}
                className="w-full"
              >
                {applyingTemplate === template.id ? "Applying..." : "Apply Template"}
              </Button>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No templates found for the selected category.
          </div>
        )}
      </CardContent>
    </Card>
  );
} 