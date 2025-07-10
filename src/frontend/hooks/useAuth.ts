import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  is_premium?: boolean;
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/me`);
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const loginGoogle = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@google.com", name: "Test User" }),
    });
    if (!res.ok) throw new Error("Google login failed");
    const data = await res.json();
    await checkAuthStatus(); // Refresh auth status after login
    return data;
  };

  const loginMicrosoft = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/microsoft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@microsoft.com", name: "Test User" }),
    });
    if (!res.ok) throw new Error("Microsoft login failed");
    const data = await res.json();
    await checkAuthStatus(); // Refresh auth status after login
    return data;
  };

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST",
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