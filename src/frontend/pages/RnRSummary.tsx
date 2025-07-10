import { useEffect, useState } from "react";
import { fetchRnRSummary, saveRnRSummary } from "../utils/api";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import Loading from "../components/Loading";

export default function RnRSummary() {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchRnRSummary();
        setSummary(data.summary || "");
      } catch (error) {
        console.error('Failed to load R&R summary:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSaveSummary() {
    try {
      await saveRnRSummary(summary);
      alert("R&R Summary saved!");
    } catch (error) {
      console.error('Failed to save R&R summary:', error);
      alert("Failed to save summary. Please try again.");
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-rhythmBlack dark:text-white">Quarterly R&R Summary</h1>
      <Card className="transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle>Summary Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Enter your quarterly R&R summary here..."
              rows={12}
              className="resize-vertical"
            />
            <Button onClick={handleSaveSummary} className="transition-all hover:scale-105">
              Save Summary
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 