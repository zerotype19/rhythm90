import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import AppLayout from "../components/AppLayout";
import Sidebar from "../components/Sidebar";

export default function Developer() {
  const [apiKey, setApiKey] = useState("");
  const [endpoint, setEndpoint] = useState("/api/v1/signals");
  const [method, setMethod] = useState("POST");
  const [requestBody, setRequestBody] = useState(`{
  "signal_type": "customer_feedback",
  "description": "Customer reported issue with login",
  "source": "support_ticket",
  "priority": "medium",
  "tags": ["login", "bug"]
}`);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState(0);

  const developerSidebarItems = [
    { to: "/developer", label: "API Sandbox", icon: "🧪" },
    { to: "/developer/docs", label: "Documentation", icon: "📚" },
    { to: "/developer/webhooks", label: "Webhooks", icon: "🔗" },
    { to: "/developer/sdk", label: "SDK", icon: "📦" },
    { to: "/developer/examples", label: "Examples", icon: "💡" },
  ];

  useEffect(() => {
    // Load user's API key if available
    loadUserApiKey();
  }, []);

  const loadUserApiKey = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/me`);
      const userData = await response.json();
      if (userData?.api_key) {
        setApiKey(userData.api_key);
      }
    } catch (error) {
      console.error("Failed to load user API key:", error);
    }
  };

  const handleTestRequest = async () => {
    if (!apiKey) {
      setResponse("Error: API key is required");
      return;
    }

    setLoading(true);
    setResponse("");
    const startTime = Date.now();

    try {
      const url = `${import.meta.env.VITE_API_URL}${endpoint}`;
      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
      };

      if (method !== "GET" && requestBody) {
        options.body = requestBody;
      }

      const res = await fetch(url, options);
      const data = await res.json();
      
      setResponseTime(Date.now() - startTime);
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponseTime(Date.now() - startTime);
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const generateApiKey = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setApiKey(data.apiKey);
      }
    } catch (error) {
      console.error("Failed to generate API key:", error);
    }
  };

  return (
    <AppLayout maxWidth="7xl" className="py-8" showFooter={false}>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64 lg:flex-shrink-0">
          <Sidebar items={developerSidebarItems} title="Developer" className="bg-card border rounded-lg" />
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold text-foreground">Developer Portal</h1>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              API v1.0
            </Badge>
          </div>

          {/* API Key Section */}
          <Card>
            <CardHeader>
              <CardTitle>API Key</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="flex-1"
                />
                <Button onClick={generateApiKey} variant="outline" className="whitespace-nowrap">
                  Generate New Key
                </Button>
                <Button 
                  onClick={() => copyToClipboard(apiKey)} 
                  variant="outline"
                  disabled={!apiKey}
                  className="whitespace-nowrap"
                >
                  Copy
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Keep your API key secure. Never share it in client-side code or public repositories.
              </p>
            </CardContent>
          </Card>

          {/* API Sandbox */}
          <Card>
            <CardHeader>
              <CardTitle>API Sandbox</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Request Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Endpoint
                  </label>
                  <Input
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="/api/v1/signals"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Method
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
              </div>

              {/* Request Body */}
              {method !== "GET" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Request Body (JSON)
                  </label>
                  <textarea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    className="w-full h-32 p-3 border border-border rounded-md bg-background text-foreground font-mono text-sm"
                    placeholder="Enter JSON request body..."
                  />
                </div>
              )}

              {/* Send Request Button */}
              <Button 
                onClick={handleTestRequest} 
                disabled={loading || !apiKey}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending Request...
                  </>
                ) : (
                  "Send Request"
                )}
              </Button>

              {/* Response */}
              {response && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-foreground">
                      Response {responseTime > 0 && `(${responseTime}ms)`}
                    </label>
                    <Button 
                      onClick={() => copyToClipboard(response)} 
                      variant="outline" 
                      size="sm"
                    >
                      Copy Response
                    </Button>
                  </div>
                  <div className="bg-muted border border-border rounded-md p-4">
                    <pre className="text-sm text-foreground font-mono whitespace-pre-wrap overflow-x-auto">
                      {response}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Log a Signal</h4>
                  <div className="bg-muted p-3 rounded-md">
                    <code className="text-sm text-foreground">
                      POST /api/v1/signals<br/>
                      {`{"signal_type": "customer_feedback", "description": "..."}`}
                    </code>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEndpoint("/api/v1/signals");
                      setMethod("POST");
                      setRequestBody(`{
  "signal_type": "customer_feedback",
  "description": "Customer reported issue with login",
  "source": "support_ticket",
  "priority": "medium",
  "tags": ["login", "bug"]
}`);
                    }}
                  >
                    Try This
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Get Signals</h4>
                  <div className="bg-muted p-3 rounded-md">
                    <code className="text-sm text-foreground">
                      GET /api/v1/signals<br/>
                      Query params: limit, offset, type
                    </code>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEndpoint("/api/v1/signals?limit=10&offset=0");
                      setMethod("GET");
                      setRequestBody("");
                    }}
                  >
                    Try This
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Documentation Links */}
          <Card>
            <CardHeader>
              <CardTitle>Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <a 
                  href="/developer/docs" 
                  className="p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <h4 className="font-medium text-foreground mb-2">📚 API Reference</h4>
                  <p className="text-sm text-muted-foreground">
                    Complete API documentation with all endpoints and parameters
                  </p>
                </a>
                <a 
                  href="/developer/webhooks" 
                  className="p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <h4 className="font-medium text-foreground mb-2">🔗 Webhooks</h4>
                  <p className="text-sm text-muted-foreground">
                    Set up webhooks to receive real-time updates
                  </p>
                </a>
                <a 
                  href="/developer/sdk" 
                  className="p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <h4 className="font-medium text-foreground mb-2">📦 SDK</h4>
                  <p className="text-sm text-muted-foreground">
                    Official SDKs for JavaScript, Python, and more
                  </p>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
} 