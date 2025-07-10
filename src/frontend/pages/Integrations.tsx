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

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const response = await fetch('/integrations/list');
      const data = await response.json();
      setIntegrations(data.integrations);
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
      // Mock disconnect - in real implementation, this would call a disconnect endpoint
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, connected: false }
          : integration
      ));
      setMessage(`Successfully disconnected ${integrationId}`);
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
    </div>
  );
} 