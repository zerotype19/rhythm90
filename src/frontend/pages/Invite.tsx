import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Link } from "react-router-dom";

export default function Invite() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async function sendInvite() {
    if (!validateEmail(email)) {
      setMessage({ type: "error", text: "Please enter a valid email address." });
      return;
    }

    setLoading(true);
    setMessage(null);
    setInviteLink(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage({ type: "success", text: "Invite sent successfully!" });
        setInviteLink(data.inviteLink);
        setEmail("");
      } else {
        setMessage({ type: "error", text: "Failed to send invite. Please try again." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  function copyInviteLink() {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      alert("Invite link copied to clipboard!");
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <div className="mb-6">
        <Link to="/admin" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">
          ← Back to Admin
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send Beta Invite</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full"
              onKeyPress={(e) => e.key === "Enter" && sendInvite()}
            />
          </div>

          {message && (
            <div className={`p-3 rounded-md ${
              message.type === "success" 
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}>
              {message.text}
            </div>
          )}

          {inviteLink && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Invite Link Generated:
              </p>
              <div className="flex items-center space-x-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="text-sm bg-white dark:bg-gray-800"
                />
                <Button size="sm" onClick={copyInviteLink}>
                  Copy
                </Button>
              </div>
            </div>
          )}

          <Button 
            onClick={sendInvite} 
            disabled={loading || !email.trim()}
            className="w-full"
          >
            {loading ? "Sending..." : "Send Invite"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 