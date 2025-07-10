import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { useExperiment } from "../hooks/useExperiment";
import AppLayout from "../components/AppLayout";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Marketing Director",
    company: "TechFlow Inc",
    quote: "Rhythm90 has transformed how we track marketing signals. The AI insights are game-changing for our campaigns.",
    avatar: "👩‍💼"
  },
  {
    name: "Marcus Rodriguez",
    role: "Growth Lead",
    company: "StartupXYZ",
    quote: "Finally, a platform that helps us make sense of all our marketing data. The team collaboration features are incredible.",
    avatar: "👨‍💻"
  },
  {
    name: "Emily Watson",
    role: "VP Marketing",
    company: "ScaleUp Co",
    quote: "The R&R summaries have become our secret weapon for continuous improvement. Highly recommend!",
    avatar: "👩‍🎓"
  },
  {
    name: "David Kim",
    role: "CMO",
    company: "InnovateCorp",
    quote: "Rhythm90's signal tracking has helped us identify patterns we never noticed before. ROI has improved 40%.",
    avatar: "👨‍💼"
  }
];

export default function Marketing() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { variant: heroVariant, logEvent } = useExperiment("marketing_hero");

  useEffect(() => {
    if (heroVariant) logEvent("exposure");
  }, [heroVariant]);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok) {
        setSubmitted(true);
        setEmail("");
      } else {
        alert("Failed to join waitlist. Please try again.");
      }
    } catch (error) {
      console.error("Waitlist error:", error);
      alert("Failed to join waitlist. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout maxWidth="7xl" className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            🚀 Now in Beta
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {heroVariant === "B"
              ? "Smarter Marketing Starts Here"
              : "Smarter Marketing Quarters Start Here"}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            {heroVariant === "C"
              ? "AI-powered insights for every marketing team."
              : "Rhythm90 helps marketing teams track, analyze, and act on marketing insights with AI-powered recommendations and collaborative tools."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              onClick={() => { logEvent("interaction", { action: "Try Demo" }); window.location.href = "/"; }}
            >
              {heroVariant === "C" ? "Get Started" : "Try Demo"}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 py-3"
              onClick={() => { logEvent("interaction", { action: "Join Waitlist" }); document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' }); }}
            >
              {heroVariant === "C" ? "Try Now" : "Join Waitlist"}
            </Button>
          </div>
        </div>
      </section>

      {/* Product Hunt Banner */}
      <section className="py-8 px-4 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-4">
            <div className="text-2xl">🚀</div>
            <div className="text-center">
              <p className="text-orange-800 dark:text-orange-200 font-medium">
                We're launching on Product Hunt!
              </p>
              <p className="text-orange-700 dark:text-orange-300 text-sm">
                Support us and get early access to new features
              </p>
            </div>
            <Button 
              size="sm" 
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={() => window.open('https://producthunt.com/posts/rhythm90', '_blank')}
            >
              🐱 Vote Now
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to track marketing signals
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              From observation to action, Rhythm90 streamlines your marketing intelligence workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="text-3xl mb-2">📊</div>
                <CardTitle>Marketing Plays</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Create and manage marketing strategies with clear outcomes and execution plans.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="text-3xl mb-2">🔍</div>
                <CardTitle>Signal Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Log observations, meanings, and actions to build a comprehensive marketing intelligence system.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="text-3xl mb-2">🤖</div>
                <CardTitle>AI Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Get AI-powered recommendations and hypotheses to improve your marketing performance.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="text-3xl mb-2">👥</div>
                <CardTitle>Team Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Work together with your team to share insights and coordinate marketing efforts.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="text-3xl mb-2">📈</div>
                <CardTitle>Analytics & Reporting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Track performance metrics and generate insights to optimize your marketing strategies.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="text-3xl mb-2">🔗</div>
                <CardTitle>Integrations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Connect with your existing tools and workflows for seamless data flow.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Loved by marketing teams everywhere
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              See what our users are saying about Rhythm90
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{testimonial.avatar}</div>
                    <div className="flex-1">
                      <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
                        "{testimonial.quote}"
                      </p>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {testimonial.role} at {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Get early access to Rhythm90
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join the waitlist and be among the first to experience the future of marketing intelligence.
          </p>

          {!submitted ? (
            <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {submitting ? "Joining..." : "Join Waitlist"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <div className="text-green-600 dark:text-green-400 text-2xl mb-2">✅</div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                You're on the list!
              </h3>
              <p className="text-green-700 dark:text-green-300">
                We'll notify you when Rhythm90 is ready for you.
              </p>
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  );
} 