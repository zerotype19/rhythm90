import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useState } from "react";

export default function PublicApi() {
  const [selectedLanguage, setSelectedLanguage] = useState("curl");

  const languages = [
    { id: "curl", name: "cURL", icon: "🔗" },
    { id: "javascript", name: "JavaScript", icon: "🟨" },
    { id: "python", name: "Python", icon: "🐍" }
  ];

  const endpoints = [
    {
      name: "Get Plays",
      method: "GET",
      path: "/api/plays",
      description: "Retrieve all plays for your team",
      response: {
        plays: [
          {
            id: "play-123",
            name: "Boost Social Engagement",
            target_outcome: "Increase social media engagement by 25%",
            status: "active",
            created_at: "2024-01-15T10:30:00Z"
          }
        ]
      }
    },
    {
      name: "Get Signals",
      method: "GET",
      path: "/api/signals",
      description: "Retrieve all signals for your team",
      response: {
        signals: [
          {
            id: "signal-456",
            observation: "Competitor launched new product feature",
            meaning: "Market validation for our planned feature",
            action: "Accelerate development timeline",
            created_at: "2024-01-16T14:20:00Z",
            play_name: "Boost Social Engagement"
          }
        ]
      }
    },
    {
      name: "Get Analytics",
      method: "GET",
      path: "/api/analytics",
      description: "Get basic analytics for your team",
      response: {
        analytics: {
          totalPlays: 5,
          totalSignals: 23,
          totalAIUsage: 67
        }
      }
    }
  ];

  function getCodeExample(endpoint: any, language: string) {
    const baseUrl = "https://rhythm90.io";
    const apiKey = "YOUR_API_KEY";

    switch (language) {
      case "curl":
        return `curl -X ${endpoint.method} "${baseUrl}${endpoint.path}" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json"`;
      
      case "javascript":
        return `const response = await fetch('${baseUrl}${endpoint.path}', {
  method: '${endpoint.method}',
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`;
      
      case "python":
        return `import requests

response = requests.${endpoint.method.toLowerCase()}(
    '${baseUrl}${endpoint.path}',
    headers={
        'Authorization': f'Bearer {apiKey}',
        'Content-Type': 'application/json'
    }
)

data = response.json()
print(data)`;
      
      default:
        return "";
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🔌 Public API</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Integrate Rhythm90 into your applications with our REST API
        </p>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Quick Start</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">1. Get Your API Key</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Go to your Admin panel and create an API key. Store it securely - you won't see it again!
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">2. Make Your First Request</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Include your API key in the Authorization header:
              </p>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <code className="text-sm">Authorization: Bearer YOUR_API_KEY</code>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">3. Choose Your Language</h3>
              <div className="flex space-x-2">
                {languages.map((lang) => (
                  <Button
                    key={lang.id}
                    variant={selectedLanguage === lang.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLanguage(lang.id)}
                  >
                    {lang.icon} {lang.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle>🔐 Authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              All API requests require authentication using a Bearer token in the Authorization header.
            </p>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Security Note</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Keep your API key secure and never expose it in client-side code. 
                API keys provide full access to your team's data.
              </p>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
              <code className="text-sm">
                Authorization: Bearer rk_1234567890abcdef...
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">📡 API Endpoints</h2>
        
        {endpoints.map((endpoint, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="font-mono">
                    {endpoint.method}
                  </Badge>
                  <span className="font-mono text-lg">{endpoint.path}</span>
                </div>
                <span className="text-gray-600 dark:text-gray-400 font-normal">
                  {endpoint.name}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  {endpoint.description}
                </p>

                <div>
                  <h4 className="font-medium mb-2">Example Request</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg relative">
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(getCodeExample(endpoint, selectedLanguage))}
                    >
                      Copy
                    </Button>
                    <pre className="text-sm overflow-x-auto">
                      <code>{getCodeExample(endpoint, selectedLanguage)}</code>
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Example Response</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg relative">
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(JSON.stringify(endpoint.response, null, 2))}
                    >
                      Copy
                    </Button>
                    <pre className="text-sm overflow-x-auto">
                      <code>{JSON.stringify(endpoint.response, null, 2)}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rate Limits */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Rate Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              API requests are rate limited to ensure fair usage:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">100</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Requests per minute</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">1,000</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Requests per hour</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">10,000</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Requests per day</div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Rate Limit Headers</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Response headers include rate limit information:
              </p>
              <div className="mt-2 space-y-1 text-sm">
                <div><code>X-RateLimit-Limit:</code> Requests allowed per window</div>
                <div><code>X-RateLimit-Remaining:</code> Requests remaining in current window</div>
                <div><code>X-RateLimit-Reset:</code> Time when the rate limit resets</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Handling */}
      <Card>
        <CardHeader>
          <CardTitle>⚠️ Error Handling</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              The API uses standard HTTP status codes and returns error details in JSON format.
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">401</Badge>
                <div>
                  <span className="font-medium">Unauthorized</span>
                  <span className="text-gray-600 dark:text-gray-400"> - Invalid or missing API key</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">403</Badge>
                <div>
                  <span className="font-medium">Forbidden</span>
                  <span className="text-gray-600 dark:text-gray-400"> - API key revoked or insufficient permissions</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">429</Badge>
                <div>
                  <span className="font-medium">Too Many Requests</span>
                  <span className="text-gray-600 dark:text-gray-400"> - Rate limit exceeded</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">500</Badge>
                <div>
                  <span className="font-medium">Internal Server Error</span>
                  <span className="text-gray-600 dark:text-gray-400"> - Something went wrong on our end</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Error Response Format</h4>
              <pre className="text-sm">
                <code>{JSON.stringify({
                  error: "Invalid API key",
                  message: "The provided API key is invalid or has been revoked",
                  status: 401
                }, null, 2)}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle>💬 Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Having trouble with the API? We're here to help!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium mb-2">📚 Documentation</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Check our comprehensive documentation for detailed examples and guides.
                </p>
                <Button variant="outline" size="sm">
                  View Docs
                </Button>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-medium mb-2">💬 Support</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Get help from our support team or community.
                </p>
                <Button variant="outline" size="sm">
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 