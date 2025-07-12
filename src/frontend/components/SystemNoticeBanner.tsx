import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface SystemNoticeBannerProps {
  className?: string;
}

export default function SystemNoticeBanner({ className }: SystemNoticeBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [notice, setNotice] = useState<string>('');

  useEffect(() => {
    // Check for system notice in environment or localStorage
    const systemNotice = import.meta.env.VITE_SYSTEM_NOTICE || localStorage.getItem('system-notice');
    
    if (systemNotice && !localStorage.getItem('system-notice-dismissed')) {
      setNotice(systemNotice);
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('system-notice-dismissed', 'true');
  };

  if (!isVisible || !notice) {
    return null;
  }

  return (
    <div className={cn(
      "bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {notice}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
} 