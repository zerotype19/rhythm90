import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../hooks/useAuth';
import { fetchApiKeys, createApiKey, revokeApiKey } from '../utils/api';

interface ApiKey {
  id: string;
  name: string;
  permissions: string;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface UsageData {
  dailyUsage: Array<{
    date: string;
    request_count: number;
    avg_response_time: number;
    error_count: number;
  }>;
  totalStats: {
    totalRequests: number;
    activeDays: number;
    overallAvgResponseTime: number;
  };
  rateLimit: {
    daily: number;
    used: number;
    remaining: number;
  };
}

export default function Developer() {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [showNewKey, setShowNewKey] = useState(false);

  useEffect(() => {
    fetchApiKeysData();
    fetchUsageData();
  }, []);

  const fetchApiKeysData = async () => {
    try {
      const response = await fetchApiKeys();
      setApiKeys(response.keys || []);
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    }
  };

  const fetchUsageData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/developer/usage`);
      const data = await response.json();
      setUsageData(data);
    } catch (error) {
      console.error('Failed to fetch usage data:', error);
    }
  };

  const generateApiKey = async () => {
    if (!newKeyName.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await createApiKey(newKeyName);
      setNewApiKey(response.apiKey);
      setShowNewKey(true);
      setNewKeyName('');
      fetchApiKeysData();
    } catch (error) {
      console.error('Failed to generate API key:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const revokeApiKeyHandler = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await revokeApiKey(keyId);
      fetchApiKeysData();
    } catch (error) {
      console.error('Failed to revoke API key:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const formatPermissions = (permissions: string) => {
    try {
      const perms = JSON.parse(permissions);
      return perms.map((perm: string) => (
        <Badge key={perm} variant="secondary" className="mr-1 mb-1">
          {perm}
        </Badge>
      ));
    } catch {
      return <span className="text-muted-foreground">No permissions</span>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Developer Portal</h1>
        <p className="text-muted-foreground">
          Manage your API keys and monitor usage for the Rhythm90 API.
        </p>
      </div>

      {/* New API Key Generation */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Generate New API Key</CardTitle>
          <CardDescription>
            Create a new API key to access the Rhythm90 API programmatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter API key name (e.g., Production App)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={generateApiKey} 
              disabled={!newKeyName.trim() || isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Key'}
            </Button>
          </div>
          
          {showNewKey && newApiKey && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-2">
                API Key Generated Successfully!
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-white border rounded text-sm font-mono">
                  {newApiKey}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(newApiKey)}
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-green-600 mt-2">
                Store this key securely - it won't be shown again.
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowNewKey(false)}
                className="mt-2"
              >
                Dismiss
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* API Keys List */}
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Manage your active API keys and their permissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No API keys found.</p>
                <p className="text-sm">Generate your first API key above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{key.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created {formatDate(key.created_at)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                                                 onClick={() => revokeApiKeyHandler(key.id)}
                      >
                        Revoke
                      </Button>
                    </div>
                    <div className="mb-2">
                      <p className="text-sm font-medium mb-1">Permissions:</p>
                      <div className="flex flex-wrap">
                        {formatPermissions(key.permissions)}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Last used: {formatDate(key.last_used_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Metrics</CardTitle>
            <CardDescription>
              Monitor your API usage and rate limits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usageData ? (
              <div className="space-y-6">
                {/* Rate Limit */}
                <div>
                  <h3 className="font-medium mb-2">Rate Limit</h3>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Daily Usage</span>
                      <span className="text-sm font-medium">
                        {usageData.rateLimit.used} / {usageData.rateLimit.daily}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            (usageData.rateLimit.used / usageData.rateLimit.daily) * 100,
                            100
                          )}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {usageData.rateLimit.remaining} requests remaining today
                    </p>
                  </div>
                </div>

                {/* Total Stats */}
                <div>
                  <h3 className="font-medium mb-2">Last 30 Days</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {usageData.totalStats.totalRequests.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Requests</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {usageData.totalStats.activeDays}
                      </div>
                      <div className="text-sm text-muted-foreground">Active Days</div>
                    </div>
                  </div>
                </div>

                {/* Average Response Time */}
                <div>
                  <h3 className="font-medium mb-2">Performance</h3>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(usageData.totalStats.overallAvgResponseTime || 0)}ms
                    </div>
                    <div className="text-sm text-muted-foreground">Average Response Time</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Loading usage data...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* API Documentation */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>
            Learn how to use the Rhythm90 API with your API keys.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <h3>Authentication</h3>
            <p>
              Include your API key in the Authorization header of all requests:
            </p>
            <pre className="bg-gray-100 p-3 rounded text-sm">
{`Authorization: Bearer YOUR_API_KEY_HERE`}
            </pre>

            <h3>Base URL</h3>
            <p>All API endpoints are relative to your worker URL.</p>

            <h3>Endpoints</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Get Analytics</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm">
{`GET /api/analytics
Authorization: Bearer YOUR_API_KEY`}
                </pre>
                <p className="text-sm text-muted-foreground">
                  Returns team analytics including plays, signals, and time-series data.
                </p>
              </div>

              <div>
                <h4 className="font-medium">Get Plays</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm">
{`GET /api/plays
Authorization: Bearer YOUR_API_KEY`}
                </pre>
                <p className="text-sm text-muted-foreground">
                  Returns all plays for your team.
                </p>
              </div>

              <div>
                <h4 className="font-medium">Get Signals</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm">
{`GET /api/signals?play_id=PLAY_ID
Authorization: Bearer YOUR_API_KEY`}
                </pre>
                <p className="text-sm text-muted-foreground">
                  Returns signals for a specific play.
                </p>
              </div>
            </div>

            <h3>Rate Limits</h3>
            <p>
              API requests are limited to {usageData?.rateLimit.daily || 1000} requests per day per team.
              Rate limit headers are included in all responses.
            </p>

            <h3>Error Handling</h3>
            <p>
              The API returns standard HTTP status codes. Error responses include a message field
              with details about what went wrong.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 