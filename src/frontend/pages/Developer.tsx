import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../hooks/useAuth";
import { fetchApiKeys, createApiKey, revokeApiKey } from "../utils/api";

interface ApiKey {
  id: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

export default function Developer() {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [creatingKey, setCreatingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [revokingKey, setRevokingKey] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadApiKeys();
    }
  }, [isAdmin]);

  async function loadApiKeys() {
    try {
      const data = await fetchApiKeys();
      setApiKeys(data.apiKeys || []);
    } catch (error) {
      console.error("Failed to load API keys:", error);
    }
  }

  async function handleCreateApiKey(e: React.FormEvent) {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    setCreatingKey(true);
    try {
      const result = await createApiKey(newKeyName);
      setNewApiKey(result.apiKey);
      setNewKeyName("");
      await loadApiKeys();
    } catch (error) {
      console.error("Failed to create API key:", error);
      alert("Failed to create API key. Please try again.");
    } finally {
      setCreatingKey(false);
    }
  }

  async function handleRevokeApiKey(keyId: string) {
    setRevokingKey(keyId);
    try {
      await revokeApiKey(keyId);
      await loadApiKeys();
    } catch (error) {
      console.error("Failed to revoke API key:", error);
      alert("Failed to revoke API key. Please try again.");
    } finally {
      setRevokingKey(null);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Rhythm90 Public API
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Integrate Rhythm90's marketing signals platform into your applications. 
          Access plays, signals, and analytics data programmatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* API Key Management (Admin Only) */}
        {isAdmin && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔑 API Keys
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Create New Key */}
                <form onSubmit={handleCreateApiKey} className="space-y-3">
                  <Input
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="API key name"
                    required
                  />
                  <Button type="submit" disabled={creatingKey} className="w-full">
                    {creatingKey ? "Creating..." : "Create API Key"}
                  </Button>
                </form>

                {/* New Key Display */}
                {newApiKey && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                    <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                      <strong>New API Key Created!</strong> Copy it now - you won't see it again.
                    </p>
                    <div className="flex gap-2">
                      <code className="flex-1 p-2 bg-white dark:bg-gray-800 border rounded text-sm">
                        {newApiKey}
                      </code>
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(newApiKey)}
                        variant="outline"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                )}

                {/* Existing Keys */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Your API Keys</h4>
                  {apiKeys.length === 0 ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No API keys created yet.
                    </p>
                  ) : (
                    apiKeys.map((key) => (
                      <div key={key.id} className="p-3 border rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {key.name}
                          </span>
                          <Badge variant={key.is_active ? "default" : "secondary"}>
                            {key.is_active ? "Active" : "Revoked"}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          Created: {new Date(key.created_at).toLocaleDateString()}
                        </p>
                        {key.last_used_at && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            Last used: {new Date(key.last_used_at).toLocaleDateString()}
                          </p>
                        )}
                        {key.is_active && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRevokeApiKey(key.id)}
                            disabled={revokingKey === key.id}
                          >
                            {revokingKey === key.id ? "Revoking..." : "Revoke"}
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Rate Limits */}
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Rate Limits
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Free: 1,000 requests/day<br />
                    Premium: 10,000 requests/day
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* API Documentation */}
        <div className={isAdmin ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="space-y-8">
            {/* Authentication */}
            <Card>
              <CardHeader>
                <CardTitle>🔐 Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  All API requests require an API key to be included in the Authorization header.
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                  <code className="text-sm">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                </div>
              </CardContent>
            </Card>

            {/* Endpoints */}
            <Card>
              <CardHeader>
                <CardTitle>📡 API Endpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Plays Endpoint */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="default">GET</Badge>
                    <code className="text-lg">/api/plays</code>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Retrieve all plays for your team.
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">cURL</h5>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        <code className="text-sm">
                          curl -X GET "https://rhythm90.io/api/plays" \<br />
                          &nbsp;&nbsp;-H "Authorization: Bearer YOUR_API_KEY"
                        </code>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">JavaScript</h5>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        <code className="text-sm">
                          const response = await fetch('https://rhythm90.io/api/plays', {{'{'}}<br />
                          &nbsp;&nbsp;headers: {{'{'}}<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;'Authorization': 'Bearer YOUR_API_KEY'<br />
                          &nbsp;&nbsp;{{'}'}}<br />
                          {{'}'}});<br />
                          const data = await response.json();
                        </code>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Python</h5>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        <code className="text-sm">
                          import requests<br /><br />
                          response = requests.get(<br />
                          &nbsp;&nbsp;'https://rhythm90.io/api/plays',<br />
                          &nbsp;&nbsp;headers={{'{'}}'Authorization': 'Bearer YOUR_API_KEY'{{'}'}}<br />
                          )<br />
                          data = response.json()
                        </code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signals Endpoint */}
                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="default">GET</Badge>
                    <code className="text-lg">/api/signals</code>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Retrieve all signals for your team.
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">cURL</h5>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        <code className="text-sm">
                          curl -X GET "https://rhythm90.io/api/signals" \<br />
                          &nbsp;&nbsp;-H "Authorization: Bearer YOUR_API_KEY"
                        </code>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">JavaScript</h5>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        <code className="text-sm">
                          const response = await fetch('https://rhythm90.io/api/signals', {{'{'}}<br />
                          &nbsp;&nbsp;headers: {{'{'}}<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;'Authorization': 'Bearer YOUR_API_KEY'<br />
                          &nbsp;&nbsp;{{'}'}}<br />
                          {{'}'}});<br />
                          const data = await response.json();
                        </code>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Python</h5>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        <code className="text-sm">
                          import requests<br /><br />
                          response = requests.get(<br />
                          &nbsp;&nbsp;'https://rhythm90.io/api/signals',<br />
                          &nbsp;&nbsp;headers={{'{'}}'Authorization': 'Bearer YOUR_API_KEY'{{'}'}}<br />
                          )<br />
                          data = response.json()
                        </code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analytics Endpoint */}
                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="default">GET</Badge>
                    <code className="text-lg">/api/analytics</code>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Retrieve analytics data for your team.
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">cURL</h5>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        <code className="text-sm">
                          curl -X GET "https://rhythm90.io/api/analytics" \<br />
                          &nbsp;&nbsp;-H "Authorization: Bearer YOUR_API_KEY"
                        </code>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">JavaScript</h5>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        <code className="text-sm">
                          const response = await fetch('https://rhythm90.io/api/analytics', {{'{'}}<br />
                          &nbsp;&nbsp;headers: {{'{'}}<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;'Authorization': 'Bearer YOUR_API_KEY'<br />
                          &nbsp;&nbsp;{{'}'}}<br />
                          {{'}'}});<br />
                          const data = await response.json();
                        </code>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Python</h5>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        <code className="text-sm">
                          import requests<br /><br />
                          response = requests.get(<br />
                          &nbsp;&nbsp;'https://rhythm90.io/api/analytics',<br />
                          &nbsp;&nbsp;headers={{'{'}}'Authorization': 'Bearer YOUR_API_KEY'{{'}'}}<br />
                          )<br />
                          data = response.json()
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response Examples */}
            <Card>
              <CardHeader>
                <CardTitle>📋 Response Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Plays Response</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      <pre className="text-sm overflow-x-auto">
{`{
  "plays": [
    {
      "id": "play-123",
      "name": "Increase Engagement",
      "target_outcome": "Boost social media engagement by 25%",
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}`}
                      </pre>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Signals Response</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      <pre className="text-sm overflow-x-auto">
{`{
  "signals": [
    {
      "id": "signal-456",
      "observation": "High email open rate",
      "meaning": "Audience is engaged with email content",
      "action": "Double down on email marketing strategy",
      "created_at": "2024-01-15T14:20:00Z",
      "play_name": "Increase Engagement"
    }
  ]
}`}
                      </pre>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Analytics Response</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      <pre className="text-sm overflow-x-auto">
{`{
  "analytics": {
    "totalPlays": 5,
    "totalSignals": 23,
    "totalAIUsage": 156
  }
}`}
                      </pre>
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
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Rate Limit Exceeded (429)</h4>
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                      <pre className="text-sm text-red-800 dark:text-red-200">
{`{
  "error": "Rate limit exceeded",
  "limit": 1000,
  "reset": "2024-01-16T00:00:00Z"
}`}
                      </pre>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Invalid API Key (401)</h4>
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                      <pre className="text-sm text-red-800 dark:text-red-200">
{`{
  "error": "Invalid API key"
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coming Soon */}
            <Card>
              <CardHeader>
                <CardTitle>🚀 Coming Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• Interactive API sandbox for testing endpoints</li>
                  <li>• Advanced API scopes and permissions</li>
                  <li>• Webhook support for real-time updates</li>
                  <li>• SDKs for popular programming languages</li>
                  <li>• Advanced analytics and reporting endpoints</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 