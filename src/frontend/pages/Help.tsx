import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is Rhythm90?",
    answer: "Rhythm90 is a marketing signals platform that helps teams track, analyze, and act on marketing insights. It provides tools for creating marketing plays, logging signals (observations and actions), and generating AI-powered recommendations to improve your marketing performance.",
    category: "Getting Started"
  },
  {
    question: "How do I upgrade?",
    answer: "To upgrade to premium, click the 'Manage Billing' button in your settings or visit the pricing page. Premium features include advanced analytics, unlimited plays and signals, AI assistant features, and priority support. You can choose between Pro ($29/month) or Premium ($49/month) plans.",
    category: "Billing"
  },
  {
    question: "How to use the dashboard?",
    answer: "The dashboard shows an overview of your marketing plays and recent signals. You can view key metrics, create new plays, and see your team's activity. Use the navigation to access different sections like Team, Training, and R&R Summary. Premium users get access to advanced analytics and unlimited features.",
    category: "Features"
  },
  {
    question: "What are signals?",
    answer: "Signals are observations about your marketing performance that you log in the system. Each signal includes an observation (what you noticed), meaning (why it matters), and action (what you'll do about it). These help you track patterns, learn from successes and failures, and make data-driven marketing decisions.",
    category: "Features"
  },
  {
    question: "How do I invite my team?",
    answer: "Team admins can invite new members by going to the Admin page and clicking 'Send Beta Invite'. Enter the email address and an invitation link will be generated. The invited user can then create their account and join your team. Invitations expire after 7 days for security.",
    category: "Team Management"
  }
];

export default function Help() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFaqs, setFilteredFaqs] = useState<FAQItem[]>(faqData);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredFaqs(faqData);
      return;
    }

    const filtered = faqData.filter(faq => {
      const searchLower = searchTerm.toLowerCase();
      return (
        faq.question.toLowerCase().includes(searchLower) ||
        faq.answer.toLowerCase().includes(searchLower)
      );
    });
    setFilteredFaqs(filtered);
  }, [searchTerm]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Help Center</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Find answers to common questions about Rhythm90
        </p>
        
        {/* Search Bar */}
        <div className="max-w-md mx-auto">
          <Input
            type="text"
            placeholder="Search questions and answers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          {searchTerm && (
            <p className="text-sm text-gray-500 mt-2">
              Found {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {filteredFaqs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No results found for "{searchTerm}". Try a different search term.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredFaqs.map((faq, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{faq.question}</CardTitle>
                  {faq.category && (
                    <Badge variant="secondary" className="text-xs">
                      {faq.category}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {faq.answer}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <CardTitle className="text-2xl">Still need help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Can't find what you're looking for? We're here to help!
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              📧 Email us at: <a href="mailto:support@rhythm90.io" className="text-blue-600 hover:underline">support@rhythm90.io</a>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              💬 Join our community: <a href="#" className="text-blue-600 hover:underline">Discord</a>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              📖 Check our documentation: <a href="#" className="text-blue-600 hover:underline">docs.rhythm90.io</a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Crisp Chat Widget Placeholder */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => {
            // TODO: Initialize Crisp chat widget
            alert("Chat widget coming soon! For now, please email us at support@rhythm90.io");
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110"
          title="Chat with us"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
    </div>
  );
} 