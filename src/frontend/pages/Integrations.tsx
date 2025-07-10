import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'available' | 'coming_soon' | 'beta';
  icon: string;
  connected: boolean;
}

export default function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [zapierKeys, setZapierKeys] = useState<any[]>([]);
  const [showZapierSetup, setShowZapierSetup] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newApiKey, setNewApiKey] = useState('');

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const response = await fetch('/integrations/list');
      const data = await response.json();
      
      // Check for existing Slack connection
      const slackResponse = await fetch('/integrations/slack/status');
      let slackStatus = { connected: false, workspace: null };
      
      try {
        const slackData = await slackResponse.json();
        if (slackData.success) {
          slackStatus = { connected: slackData.connected, workspace: slackData.workspace };
        }
      } catch (error) {
        // Slack status endpoint might not exist yet, that's okay
      }

      // Check for existing Teams connection
      const teamsResponse = await fetch('/integrations/teams/status');
      let teamsStatus = { connected: false, workspace: null };
      
      try {
        const teamsData = await teamsResponse.json();
        if (teamsData.success) {
          teamsStatus = { connected: teamsData.connected, workspace: teamsData.workspace };
        }
      } catch (error) {
        // Teams status endpoint might not exist yet, that's okay
      }

      // Load Zapier API keys
      const zapierResponse = await fetch('/integrations/zapier/keys');
      let zapierKeys = [];
      
      try {
        const zapierData = await zapierResponse.json();
        if (zapierData.success) {
          zapierKeys = zapierData.keys || [];
        }
      } catch (error) {
        // Zapier keys endpoint might not exist yet, that's okay
      }
      
      // Update integration statuses
      const updatedIntegrations = data.integrations.map((integration: Integration) => {
        if (integration.id === 'slack') {
          return { ...integration, connected: slackStatus.connected };
        }
        if (integration.id === 'teams') {
          return { ...integration, connected: teamsStatus.connected };
        }
        if (integration.id === 'zapier') {
          return { ...integration, connected: zapierKeys.length > 0 };
        }
        return integration;
      });
      
      setIntegrations(updatedIntegrations);
      setZapierKeys(zapierKeys);
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (integrationId: string) => {
    setConnecting(integrationId);
    setMessage('');

    try {
      if (integrationId === 'slack') {
        // Handle Slack OAuth flow
        const response = await fetch('/integrations/slack/connect');
        const data = await response.json();
        
        if (data.success) {
          // Redirect to Slack OAuth
          window.location.href = data.authUrl;
        } else {
          setMessage(data.message || 'Failed to initiate Slack connection');
        }
      } else if (integrationId === 'teams') {
        // Handle Microsoft Teams OAuth flow
        const response = await fetch('/integrations/teams/connect');
        const data = await response.json();
        
        if (data.success) {
          // Redirect to Microsoft OAuth
          window.location.href = data.authUrl;
        } else {
          setMessage(data.message || 'Failed to initiate Microsoft Teams connection');
        }
      } else if (integrationId === 'zapier') {
        // Handle Zapier setup
        setShowZapierSetup(true);
        setConnecting(null);
        return;
      } else {
        // Handle other integrations (mock)
        const response = await fetch('/integrations/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ integrationId })
        });

        const data = await response.json();
        
        if (data.success) {
          setMessage(`Successfully connected ${integrationId}!`);
          // Update the integration status
          setIntegrations(prev => prev.map(integration => 
            integration.id === integrationId 
              ? { ...integration, connected: true }
              : integration
          ));
        } else {
          setMessage(data.message || 'Failed to connect integration');
        }
      }
    } catch (error) {
      setMessage('Failed to connect integration');
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) {
      return;
    }

    setConnecting(integrationId);
    setMessage('');

    try {
      if (integrationId === 'slack') {
        // Handle Slack disconnect
        const response = await fetch('/integrations/slack/disconnect', {
          method: 'POST'
        });
        const data = await response.json();
        
        if (data.success) {
          setIntegrations(prev => prev.map(integration => 
            integration.id === integrationId 
              ? { ...integration, connected: false }
              : integration
          ));
          setMessage('Successfully disconnected Slack');
        } else {
          setMessage(data.message || 'Failed to disconnect Slack');
        }
      } else if (integrationId === 'teams') {
        // Handle Microsoft Teams disconnect
        const response = await fetch('/integrations/teams/disconnect', {
          method: 'POST'
        });
        const data = await response.json();
        
        if (data.success) {
          setIntegrations(prev => prev.map(integration => 
            integration.id === integrationId 
              ? { ...integration, connected: false }
              : integration
          ));
          setMessage('Successfully disconnected Microsoft Teams');
        } else {
          setMessage(data.message || 'Failed to disconnect Microsoft Teams');
        }
      } else {
        // Mock disconnect for other integrations
        setIntegrations(prev => prev.map(integration => 
          integration.id === integrationId 
            ? { ...integration, connected: false }
            : integration
        ));
        setMessage(`Successfully disconnected ${integrationId}`);
      }
    } catch (error) {
      setMessage('Failed to disconnect integration');
    } finally {
      setConnecting(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Available</Badge>;
      case 'coming_soon':
        return <Badge variant="secondary">Coming Soon</Badge>;
      case 'beta':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Beta</Badge>;
      default:
        return null;
    }
  };

  const handleCreateZapierKey = async () => {
    if (!newKeyName.trim()) {
      setMessage('Please enter a key name');
      return;
    }

    try {
      const response = await fetch('/integrations/zapier/key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyName: newKeyName.trim() })
      });

      const data = await response.json();
      
      if (data.success) {
        setNewApiKey(data.apiKey);
        setNewKeyName('');
        setMessage('API key created successfully! Copy it now - you won\'t see it again.');
        loadIntegrations(); // Refresh to show connected status
      } else {
        setMessage(data.message || 'Failed to create API key');
      }
    } catch (error) {
      setMessage('Failed to create API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage('API key copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading integrations...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Integrations Marketplace
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connect your favorite tools and services to enhance your workflow
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-md ${
          message.includes('Successfully') 
            ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
            : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {message}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <Card key={integration.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{integration.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {integration.name}
                  </h3>
                  {getStatusBadge(integration.status)}
                </div>
              </div>
              {integration.connected && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  Connected
                </Badge>
              )}
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {integration.description}
            </p>

            <div className="flex gap-2">
              {integration.connected ? (
                <Button
                  variant="outline"
                  onClick={() => handleDisconnect(integration.id)}
                  disabled={connecting === integration.id}
                  className="flex-1"
                >
                  {connecting === integration.id ? 'Disconnecting...' : 'Disconnect'}
                </Button>
              ) : (
                <Button
                  onClick={() => handleConnect(integration.id)}
                  disabled={connecting === integration.id || integration.status === 'coming_soon'}
                  className="flex-1"
                >
                  {connecting === integration.id 
                    ? 'Connecting...' 
                    : integration.status === 'coming_soon' 
                      ? 'Coming Soon' 
                      : 'Connect'
                  }
                </Button>
              )}
            </div>

            {integration.status === 'coming_soon' && (
              <p className="text-xs text-gray-500 mt-2">
                This integration will be available soon
              </p>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Request an Integration
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Don't see the integration you need? Let us know what tools you'd like to connect with.
        </p>
        <Button variant="outline">
          Submit Request
        </Button>
      </div>

      {/* Zapier Setup Modal */}
      {showZapierSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Zapier Integration Setup
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowZapierSetup(false);
                  setNewApiKey('');
                  setNewKeyName('');
                }}
              >
                ✕
              </Button>
            </div>

            {!newApiKey ? (
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create an API key to enable Zapier webhooks for your team.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      API Key Name
                    </label>
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g., Production Webhooks"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <Button onClick={handleCreateZapierKey} className="w-full">
                    Create API Key
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 mb-4">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-400 mb-2">
                    API Key Created Successfully!
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                    Copy this API key and use it in your Zapier webhook configuration. You won't be able to see it again.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newApiKey}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-mono"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(newApiKey)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">Webhook Endpoint</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <code className="text-sm text-gray-800 dark:text-gray-200">
                      https://rhythm90.io/integrations/zapier/hooks
                    </code>
                  </div>

                  <h3 className="font-medium text-gray-900 dark:text-white">Sample Payload</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
{`{
  "apiKey": "your_api_key_here",
  "event": "play_created",
  "data": {
    "team_id": "team123",
    "user_id": "user456",
    "play_name": "New Play",
    "target_outcome": "Increase engagement"
  }
}`}
                    </pre>
                  </div>

                  <h3 className="font-medium text-gray-900 dark:text-white">Available Events</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• <code className="bg-gray-100 dark:bg-gray-600 px-1 rounded">play_created</code> - When a new play is created</li>
                    <li>• <code className="bg-gray-100 dark:bg-gray-600 px-1 rounded">signal_logged</code> - When a signal is logged</li>
                    <li>• <code className="bg-gray-100 dark:bg-gray-600 px-1 rounded">user_joined</code> - When a user joins the team</li>
                  </ul>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => {
                        setShowZapierSetup(false);
                        setNewApiKey('');
                        setNewKeyName('');
                      }}
                      className="flex-1"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 