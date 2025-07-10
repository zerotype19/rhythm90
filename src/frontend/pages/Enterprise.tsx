import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

interface SAMLConfig {
  id: string;
  entity_id: string;
  acs_url: string;
  certificate: string;
  is_active: boolean;
}

export default function Enterprise() {
  const [customDomain, setCustomDomain] = useState('');
  const [samlConfig, setSamlConfig] = useState<SAMLConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSAMLConfig();
  }, []);

  const loadSAMLConfig = async () => {
    try {
      const response = await fetch('/enterprise/saml');
      const data = await response.json();
      if (data.success && data.samlConfig) {
        setSamlConfig(data.samlConfig);
      }
    } catch (error) {
      console.error('Failed to load SAML config:', error);
    }
  };

  const handleDomainUpdate = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/enterprise/domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customDomain })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('Domain updated successfully! Please configure your DNS settings.');
      } else {
        setMessage(data.message || 'Failed to update domain');
      }
    } catch (error) {
      setMessage('Failed to update domain');
    } finally {
      setLoading(false);
    }
  };

  const handleTestSAMLConnection = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/saml/test', {
        method: 'POST'
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('SAML configuration is valid! Connection test successful.');
      } else {
        setMessage(data.message || 'SAML configuration test failed');
      }
    } catch (error) {
      setMessage('Failed to test SAML connection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Enterprise Features
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure custom domains and SSO for your organization
        </p>
      </div>

      <div className="grid gap-8">
        {/* Custom Domains */}
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Custom Domain
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Set up a custom domain for your team workspace (e.g., acme.rhythm90.io)
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Domain Name
              </label>
              <Input
                type="text"
                placeholder="acme.rhythm90.io"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter your domain (subdomains are supported)
              </p>
            </div>

            <Button 
              onClick={handleDomainUpdate}
              disabled={loading || !customDomain}
              className="w-full sm:w-auto"
            >
              {loading ? 'Updating...' : 'Update Domain'}
            </Button>

            {message && (
              <div className={`p-3 rounded-md ${
                message.includes('successfully') 
                  ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                  : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {message}
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
              <h3 className="font-medium text-blue-900 dark:text-blue-400 mb-2">
                DNS Configuration Instructions
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                After updating your domain, configure your DNS settings:
              </p>
              <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                <p className="text-sm font-mono">
                  Type: CNAME<br />
                  Name: {customDomain || 'your-domain'}<br />
                  Value: rhythm90.io
                </p>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                SSL/HTTPS is automatically handled by Cloudflare
              </p>
            </div>
          </div>
        </Card>

        {/* SAML SSO */}
        <Card className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                SAML Single Sign-On
              </h2>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Configure SAML SSO for enterprise authentication
            </p>
          </div>

          <div className="space-y-4 opacity-60">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Entity ID
              </label>
              <Input
                type="text"
                placeholder="https://your-domain.com/saml"
                disabled
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ACS URL
              </label>
              <Input
                type="text"
                placeholder="https://rhythm90.io/saml/acs"
                disabled
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Certificate
              </label>
              <textarea
                placeholder="Paste your SAML certificate here..."
                disabled
                className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              />
            </div>

            <div className="flex gap-2">
              <Button disabled className="flex-1">
                Enable SSO
              </Button>
              <Button 
                onClick={handleTestSAMLConnection}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                {loading ? 'Testing...' : 'Test Connection'}
              </Button>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-400">
              SAML SSO is coming soon! This feature will allow you to configure enterprise-grade single sign-on for your organization.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
} 