import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

interface ReferralStats {
  total: number;
  completed: number;
  pending: number;
}

export default function Referrals() {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralLink, setReferralLink] = useState<string | null>(null);
  const [stats, setStats] = useState<ReferralStats>({ total: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const response = await fetch('/referrals/stats');
      const data = await response.json();
      
      if (data.success) {
        setReferralCode(data.referralCode);
        setReferralLink(data.referralLink);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = async () => {
    setGenerating(true);
    setMessage('');

    try {
      const response = await fetch('/referrals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      
      if (data.success) {
        setReferralCode(data.referralCode);
        setReferralLink(data.referralLink);
        setMessage('Referral code generated successfully!');
      } else {
        setMessage(data.message || 'Failed to generate referral code');
      }
    } catch (error) {
      setMessage('Failed to generate referral code');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage('Copied to clipboard!');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage('Failed to copy to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading referral data...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Referrals
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Invite friends and earn rewards when they join Rhythm90
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-md ${
          message.includes('successfully') || message.includes('Copied') 
            ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
            : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {message}
        </div>
      )}

      <div className="grid gap-8">
        {/* Referral Code */}
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Your Referral Code
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Share this code with friends to earn rewards
            </p>
          </div>

          {referralCode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Referral Code
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md font-mono text-lg">
                    {referralCode}
                  </div>
                  <Button
                    onClick={() => copyToClipboard(referralCode)}
                    variant="outline"
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Referral Link
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md font-mono text-sm break-all">
                    {referralLink}
                  </div>
                  <Button
                    onClick={() => copyToClipboard(referralLink!)}
                    variant="outline"
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Generate your referral code to start earning rewards
              </p>
              <Button
                onClick={generateReferralCode}
                disabled={generating}
              >
                {generating ? 'Generating...' : 'Generate Referral Code'}
              </Button>
            </div>
          )}
        </Card>

        {/* Stats */}
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Your Referral Stats
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Track your referral performance and rewards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.total}
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-300">
                Total Referrals
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.completed}
              </div>
              <div className="text-sm text-green-800 dark:text-green-300">
                Completed
              </div>
            </div>

            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.pending}
              </div>
              <div className="text-sm text-yellow-800 dark:text-yellow-300">
                Pending
              </div>
            </div>
          </div>
        </Card>

        {/* Rewards Info */}
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              How It Works
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Earn rewards when your friends join and become active users
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">1</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Share Your Code
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Send your referral link to friends and colleagues
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">2</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  They Sign Up
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  When they use your code to create an account
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">3</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Earn Rewards
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get 1 month of premium features for each successful referral
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="font-medium text-green-900 dark:text-green-400 mb-2">
              Current Reward
            </h3>
            <p className="text-sm text-green-800 dark:text-green-300">
              <strong>1 month premium free</strong> for each successful referral
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
} 