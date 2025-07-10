import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { trackEvent, AnalyticsEvents } from "../hooks/useAnalytics";

export default function Invite() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  async function sendInvite() {
    if (!email.trim()) {
      setError("Please enter an email address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (data.success) {
        setSuccess(true);
        setInviteLink(data.inviteLink);
        
        // Track the invite sent event
        trackEvent(AnalyticsEvents.INVITE_SENT, { email });
      } else {
        setError(data.message || "Failed to send invitation");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Send Beta Invitation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!success ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendInvite()}
                />
              </div>
              
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
              
              <Button 
                onClick={sendInvite} 
                disabled={loading}
                className="w-full"
              >
                {loading ? "Sending..." : "Send Invitation"}
              </Button>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-green-600 dark:text-green-400 text-4xl">✅</div>
              <h3 className="text-lg font-semibold">Invitation Sent!</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                An invitation has been sent to <strong>{email}</strong>
              </p>
              
              {inviteLink && (
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Invitation Link:</p>
                  <code className="text-xs break-all bg-white dark:bg-gray-900 p-2 rounded block">
                    {inviteLink}
                  </code>
                </div>
              )}
              
              <Button 
                onClick={() => {
                  setSuccess(false);
                  setEmail("");
                  setInviteLink(null);
                }}
                variant="outline"
                className="w-full"
              >
                Send Another Invitation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 