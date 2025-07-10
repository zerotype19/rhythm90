import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { trackEvent, AnalyticsEvents } from "../hooks/useAnalytics";
import { useExperiment } from "../hooks/useExperiment";
import AppLayout from "../components/AppLayout";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "Up to 3 marketing plays",
      "Basic signal tracking",
      "Team collaboration",
      "Email support"
    ],
    limitations: [
      "Limited to 3 plays",
      "Basic analytics only",
      "No AI features"
    ],
    buttonText: "Current Plan",
    buttonVariant: "outline" as const,
    disabled: true
  },
  {
    name: "Premium",
    price: "$29",
    period: "per month",
    description: "For growing marketing teams",
    features: [
      "Unlimited marketing plays",
      "Advanced signal tracking",
      "AI-powered insights",
      "Advanced analytics dashboard",
      "Priority support",
      "Team management tools"
    ],
    limitations: [],
    buttonText: "Upgrade to Premium",
    buttonVariant: "default" as const,
    disabled: false,
    popular: true
  }
];

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);
  const { variant: pricingVariant, logEvent } = useExperiment("pricing_display");

  useEffect(() => {
    if (pricingVariant) logEvent("exposure");
  }, [pricingVariant]);

  const handleUpgrade = async (planName: string) => {
    setLoading(planName);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planName.toLowerCase() }),
      });

      const data = await res.json();
      
      if (data.success) {
        trackEvent(AnalyticsEvents.PREMIUM_UPGRADE_CLICKED, { plan: planName });
        // TODO: Redirect to Stripe checkout
        alert("Checkout integration coming soon!");
      } else {
        alert("Failed to start checkout. Please try again.");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <AppLayout maxWidth="6xl" className="py-8">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade when you're ready. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Trial Banner */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-2xl">🎉</span>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                14-Day Free Trial
              </h3>
            </div>
            <p className="text-blue-700 dark:text-blue-300">
              Try all Premium features free for 14 days. No credit card required.
            </p>
          </CardContent>
        </Card>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, idx) => (
            <Card 
              key={plan.name} 
              className={`relative transition-all hover:shadow-lg ${
                plan.popular ? 'ring-2 ring-primary scale-105' : ''
              } ${pricingVariant === "B" && idx === 1 ? 'border-4 border-yellow-400' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="space-y-1">
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">What's included:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations */}
                {plan.limitations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Limitations:</h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <span className="text-red-500">✗</span>
                          <span className="text-sm text-muted-foreground">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  variant={plan.buttonVariant}
                  className="w-full"
                  disabled={plan.disabled || loading === plan.name}
                  onClick={() => {
                    if (!plan.disabled) {
                      logEvent("interaction", { plan: plan.name });
                      handleUpgrade(plan.name);
                    }
                  }}
                >
                  {loading === plan.name ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    pricingVariant === "C" && plan.name === "Premium"
                      ? "Try Now"
                      : plan.buttonText
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6 text-foreground">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-2">Can I cancel anytime?</h3>
                <p className="text-muted-foreground text-sm">
                  Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-2">What's included in the free trial?</h3>
                <p className="text-muted-foreground text-sm">
                  The 14-day free trial includes all Premium features, so you can experience the full power of Rhythm90 before committing.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-2">Do you offer team discounts?</h3>
                <p className="text-muted-foreground text-sm">
                  Yes! Contact us for custom pricing for teams of 10+ users. We offer volume discounts and enterprise features.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 