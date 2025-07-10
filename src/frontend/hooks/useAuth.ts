export function useAuth() {
  const loginGoogle = () => { console.log("Google login placeholder"); };
  const loginMicrosoft = () => { console.log("Microsoft login placeholder"); };
  const logout = () => { console.log("Logout placeholder"); };
  return { loginGoogle, loginMicrosoft, logout };
} 