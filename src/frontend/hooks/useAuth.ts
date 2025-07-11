import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: string;
  is_premium?: boolean;
  providers?: string[];
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, ''); // Remove trailing slash
      const res = await fetch(`${baseUrl}/me`, { credentials: 'include' });
      console.log('[useAuth] /me response:', res);
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setIsAuthenticated(true);
        console.log('[useAuth] Authenticated user:', userData);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log('[useAuth] Not authenticated (401 or error)');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
      console.log('[useAuth] isAuthenticated:', isAuthenticated, 'user:', user);
    }
  };

  const loginGoogle = async () => {
    const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, ''); // Remove trailing slash
    window.location.href = `${baseUrl}/auth/login/google`;
  };

  const loginMicrosoft = () => {
    const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, ''); // Remove trailing slash
    window.location.href = `${baseUrl}/auth/login/microsoft`;
  };

  const logout = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, ''); // Remove trailing slash
      await fetch(`${baseUrl}/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return { 
    user, 
    isAuthenticated, 
    loading,
    loginGoogle, 
    loginMicrosoft, 
    logout,
    checkAuthStatus 
  };
} 