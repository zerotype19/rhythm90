import { useEffect, useState } from "react";
import { fetchRnRSummary, saveRnRSummary } from "../utils/api";
import { Button } from "../components/ui/button";
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
      <h1 className="text-3xl font-bold text-rhythmBlack">Quarterly R&R Summary</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Summary Content
        </label>
        <textarea 
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rhythmRed resize-vertical" 
          rows={12} 
          value={summary} 
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Enter your quarterly R&R summary here..."
        />
        <div className="mt-4">
          <Button onClick={handleSaveSummary} className="bg-rhythmRed text-white">
            Save Summary
          </Button>
        </div>
      </div>
    </div>
  );
} 