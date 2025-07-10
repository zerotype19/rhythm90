import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { loginGoogle, loginMicrosoft } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Login</h1>
      <button onClick={loginGoogle} className="bg-rhythmRed text-white p-2 rounded mr-2">Login with Google</button>
      <button onClick={loginMicrosoft} className="bg-rhythmBlack text-white p-2 rounded">Login with Microsoft</button>
    </div>
  );
} 