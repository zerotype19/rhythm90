import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface DemoContextType {
  isDemoMode: boolean;
  loading: boolean;
  loginAsDemo: () => Promise<void>;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkDemoMode() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/demo/check`);
        if (res.ok) {
          const data = await res.json();
          setIsDemoMode(data.isDemoMode);
        }
      } catch (error) {
        console.error('Failed to check demo mode:', error);
      } finally {
        setLoading(false);
      }
    }
    checkDemoMode();
  }, []);

  const loginAsDemo = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/demo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        // Store demo user in localStorage or context
        localStorage.setItem('demoUser', JSON.stringify(data.user));
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        throw new Error('Demo login failed');
      }
    } catch (error) {
      console.error('Demo login error:', error);
      alert('Demo login failed. Please try again.');
    }
  };

  return (
    <DemoContext.Provider value={{ isDemoMode, loading, loginAsDemo }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
} 