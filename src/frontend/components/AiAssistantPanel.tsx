import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { getAiSignalHelp, generateAiHypothesis } from "../utils/api";
import PremiumFeatureGuard from "./PremiumFeatureGuard";

interface AiResponse {
  success: boolean;
  interpretation?: string;
  suggestedAction?: string;
  hypothesis?: string;
  expectedOutcome?: string;
  risks?: string;
}

export default function AiAssistantPanel() {
  const [inputText, setInputText] = useState("");
  const [playDescription, setPlayDescription] = useState("");
  const [playGoal, setPlayGoal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AiResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"signal" | "hypothesis">("signal");

  async function handleSignalHelp() {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await getAiSignalHelp({
        signal_text: inputText,
        play_name: "Current Play", // Could be enhanced to get actual play context
        play_goal: "Improve marketing performance", // Could be enhanced
        recent_signals: "Recent signals would be loaded here" // Could be enhanced
      });
      setResponse(result);
    } catch (error) {
      console.error("Failed to get AI signal help:", error);
      setResponse({
        success: false,
        interpretation: "⚠️ AI is currently unavailable. Please try again later.",
        suggestedAction: "Please review the signal manually and take appropriate action."
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGenerateHypothesis() {
    if (!playDescription.trim() || !playGoal.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await generateAiHypothesis({
        play_description: playDescription,
        goal: playGoal
      });
      setResponse(result);
    } catch (error) {
      console.error("Failed to generate hypothesis:", error);
      setResponse({
        success: false,
        hypothesis: "⚠️ AI is currently unavailable. Please try again later.",
        expectedOutcome: "Review the play description and goal to determine expected outcomes.",
        risks: "Consider potential risks and mitigation strategies."
      });
    } finally {
      setIsLoading(false);
    }
  }

  function clearResponse() {
    setResponse(null);
    setInputText("");
    setPlayDescription("");
    setPlayGoal("");
  }

  return (
    <PremiumFeatureGuard feature="AI Assistant">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🤖 AI Assistant
            <Badge variant="secondary">Premium</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("signal")}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === "signal"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Signal Help
          </button>
          <button
            onClick={() => setActiveTab("hypothesis")}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === "hypothesis"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Generate Hypothesis
          </button>
        </div>

        {/* Signal Help Tab */}
        {activeTab === "signal" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Describe the signal you observed
              </label>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g., Email open rates dropped 15% this week, social media engagement is up 25%..."
                className="min-h-[100px]"
              />
            </div>
            <Button 
              onClick={handleSignalHelp} 
              disabled={isLoading || !inputText.trim()}
              className="w-full"
            >
              {isLoading ? "Analyzing..." : "Get Signal Help"}
            </Button>
          </div>
        )}

        {/* Hypothesis Tab */}
        {activeTab === "hypothesis" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Play Description
              </label>
              <Textarea
                value={playDescription}
                onChange={(e) => setPlayDescription(e.target.value)}
                placeholder="Describe the marketing play you want to run..."
                className="min-h-[80px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Goal
              </label>
              <Input
                value={playGoal}
                onChange={(e) => setPlayGoal(e.target.value)}
                placeholder="e.g., Increase conversion rate by 20%"
              />
            </div>
            <Button 
              onClick={handleGenerateHypothesis} 
              disabled={isLoading || !playDescription.trim() || !playGoal.trim()}
              className="w-full"
            >
              {isLoading ? "Generating..." : "Generate Hypothesis"}
            </Button>
          </div>
        )}

        {/* AI Response */}
        {response && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                AI Analysis
              </h4>
              <Button variant="ghost" size="sm" onClick={clearResponse}>
                Clear
              </Button>
            </div>
            
            {activeTab === "signal" && response.interpretation && (
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Interpretation
                  </h5>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {response.interpretation}
                  </p>
                </div>
                {response.suggestedAction && (
                  <div>
                    <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Suggested Action
                    </h5>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {response.suggestedAction}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "hypothesis" && response.hypothesis && (
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Hypothesis
                  </h5>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {response.hypothesis}
                  </p>
                </div>
                {response.expectedOutcome && (
                  <div>
                    <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Expected Outcome
                    </h5>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {response.expectedOutcome}
                    </p>
                  </div>
                )}
                {response.risks && (
                  <div>
                    <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Risks & Considerations
                    </h5>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {response.risks}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
    </PremiumFeatureGuard>
  );
} 