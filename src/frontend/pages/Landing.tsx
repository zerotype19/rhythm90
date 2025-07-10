import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import AppLayout from "../components/AppLayout";

export default function Landing() {
  return (
    <AppLayout maxWidth="7xl" className="py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
          Transform Your Marketing Operations
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Rhythm90.io helps modern marketing teams track signals, execute plays, and drive results with AI-powered insights.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login">
            <Button size="lg" className="text-lg px-8 py-3">
              Get Started
            </Button>
          </Link>
          <Link to="/marketing">
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              Learn More
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <Card className="text-center p-6">
          <CardHeader>
            <div className="text-4xl mb-4">📊</div>
            <CardTitle>Signal Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Capture and analyze marketing signals from across your organization to identify opportunities and trends.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center p-6">
          <CardHeader>
            <div className="text-4xl mb-4">🎯</div>
            <CardTitle>Play Execution</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Execute strategic plays with clear objectives, timelines, and success metrics to drive results.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center p-6">
          <CardHeader>
            <div className="text-4xl mb-4">🤖</div>
            <CardTitle>AI Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Get AI-powered recommendations and insights to optimize your marketing strategies and campaigns.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <Card className="text-center p-8 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-6 opacity-90">
            Join modern marketing teams who are already using Rhythm90.io to drive results.
          </p>
          <Link to="/pricing">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              View Pricing
            </Button>
          </Link>
        </CardContent>
      </Card>
    </AppLayout>
  );
} 