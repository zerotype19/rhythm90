import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";

interface FeedbackWidgetProps {
  className?: string;
}

export default function FeedbackWidget({ className = "" }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<'Bug' | 'Feature Request' | 'General Feedback'>('General Feedback');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { value: 'Bug', label: '🐛 Bug Report', description: 'Something isn\'t working' },
    { value: 'Feature Request', label: '💡 Feature Request', description: 'I have a suggestion' },
    { value: 'General Feedback', label: '💬 General Feedback', description: 'Other thoughts' }
  ] as const;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          category,
          anonymous: false
        })
      });

      if (res.ok) {
        setSubmitted(true);
        setMessage("");
        setTimeout(() => {
          setIsOpen(false);
          setSubmitted(false);
        }, 2000);
      } else {
        alert("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isOpen) {
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
        
        {/* Modal */}
        <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] z-50">
          <Card className="shadow-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Send Feedback</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {submitted ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="text-lg font-semibold mb-2">Thank you!</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your feedback has been submitted successfully.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Category Selection */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Category
                    </label>
                    <div className="space-y-2">
                      {categories.map((cat) => (
                        <label
                          key={cat.value}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                            category === cat.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <input
                            type="radio"
                            name="category"
                            value={cat.value}
                            checked={category === cat.value}
                            onChange={(e) => setCategory(e.target.value as typeof category)}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-3">
                            <div className="text-lg">{cat.label.split(' ')[0]}</div>
                            <div>
                              <div className="font-medium">{cat.label.split(' ').slice(1).join(' ')}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {cat.description}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Your Feedback
                    </label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us what you think..."
                      rows={4}
                      className="resize-none"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting || !message.trim()}
                      className="flex-1"
                    >
                      {submitting ? "Sending..." : "Send Feedback"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <Button
      onClick={() => setIsOpen(true)}
      className={`fixed bottom-4 right-4 w-14 h-14 rounded-full shadow-lg z-30 bg-blue-600 hover:bg-blue-700 text-white ${className}`}
      size="lg"
    >
      💬
    </Button>
  );
} 