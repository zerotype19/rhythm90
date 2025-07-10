export function useAuth() {
  const loginGoogle = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@google.com", name: "Test User" }),
    });
    if (!res.ok) throw new Error("Google login failed");
    console.log(await res.json());
  };

  const loginMicrosoft = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/microsoft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@microsoft.com", name: "Test User" }),
    });
    if (!res.ok) throw new Error("Microsoft login failed");
    console.log(await res.json());
  };

  const logout = () => {
    console.log("Logged out");
  };

  return { loginGoogle, loginMicrosoft, logout };
} 