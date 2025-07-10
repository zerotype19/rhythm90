import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { trackEvent, AnalyticsEvents } from "../hooks/useAnalytics";
import { useDemo } from "../contexts/DemoContext";

export default function Landing() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isDemoMode, loginAsDemo } = useDemo();

  async function joinWaitlist() {
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (data.success) {
        setSubmitted(true);
        trackEvent(AnalyticsEvents.WAITLIST_JOINED, { email });
      } else {
        setError(data.message || "Failed to join waitlist");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleDemoLogin = async () => {
    try {
      await loginAsDemo();
      trackEvent(AnalyticsEvents.DEMO_LOGIN);
    } catch (error) {
      console.error("Demo login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rhythmWhite to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-rhythmBlack dark:text-white">
            Rhythm90.io
          </div>
          <div className="space-x-4">
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-rhythmBlack dark:text-white mb-6">
            Your Team's Digital Toolbox to Run
            <span className="text-rhythmRed"> Smarter Marketing Quarters</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Streamline your marketing operations with AI-powered insights, real-time signal tracking, 
            and collaborative play management. Built for modern marketing teams.
          </p>

          {/* Waitlist Form */}
          <Card className="max-w-md mx-auto mb-8">
            <CardContent className="p-6">
              {!submitted ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-rhythmBlack dark:text-white">
                    Join the Waitlist for Early Access
                  </h3>
                  <div className="space-y-3">
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && joinWaitlist()}
                      className="w-full"
                    />
                    {error && (
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    )}
                    <Button 
                      onClick={joinWaitlist} 
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? "Joining..." : "Join Waitlist"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-green-600 dark:text-green-400 text-4xl">✅</div>
                  <h3 className="text-lg font-semibold text-rhythmBlack dark:text-white">
                    You're on the list!
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    We'll notify you when Rhythm90.io is ready for you.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Demo Login Button */}
          {isDemoMode && (
            <div className="text-center mb-12">
              <Button 
                onClick={handleDemoLogin}
                variant="outline" 
                size="sm"
                className="text-gray-600 dark:text-gray-400 hover:text-rhythmRed dark:hover:text-rhythmRed"
              >
                🚀 Try Demo Mode
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Explore the app instantly with sample data
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="text-center p-6 transition-all hover:shadow-lg hover:scale-105">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-3 text-rhythmBlack dark:text-white">
              Marketing Plays
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create, manage, and track your marketing strategies with AI-powered insights.
            </p>
          </Card>

          <Card className="text-center p-6 transition-all hover:shadow-lg hover:scale-105">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-3 text-rhythmBlack dark:text-white">
              Signal Tracking
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Log and analyze marketing signals in real-time with collaborative tools.
            </p>
          </Card>

          <Card className="text-center p-6 transition-all hover:shadow-lg hover:scale-105">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-3 text-rhythmBlack dark:text-white">
              AI Integration
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get intelligent recommendations and hypotheses powered by OpenAI.
            </p>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-rhythmBlack dark:text-white mb-4">
            Ready to Transform Your Marketing Operations?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Join the beta and be among the first to experience the future of marketing management.
          </p>
          <div className="space-x-4">
            <Link to="/dashboard">
              <Button size="lg">Try Demo</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">Learn More</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            © 2024 Rhythm90.io. Built for modern marketing teams.
          </p>
        </div>
      </footer>
    </div>
  );
} 