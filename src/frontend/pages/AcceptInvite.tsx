import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Link } from "react-router-dom";
import { trackEvent, AnalyticsEvents } from "../hooks/useAnalytics";

interface InviteValidation {
  valid: boolean;
  email?: string;
  message?: string;
}

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [validation, setValidation] = useState<InviteValidation | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [name, setName] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setValidation({ valid: false, message: "No invitation token provided" });
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/accept-invite?token=${token}`);
        const data = await res.json();
        setValidation(data);
      } catch (error) {
        setValidation({ valid: false, message: "Failed to validate invitation" });
      } finally {
        setLoading(false);
      }
    }

    validateToken();
  }, [token]);

  async function acceptInvite() {
    if (!token || !name.trim()) {
      alert("Please enter your name to continue");
      return;
    }

    setAccepting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/accept-invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name: name.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        setAccepted(true);
        trackEvent(AnalyticsEvents.INVITE_ACCEPTED, { email: data.email, name });
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setValidation({ valid: false, message: data.message });
      }
    } catch (error) {
      setValidation({ valid: false, message: "Failed to accept invitation" });
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-md mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rhythmRed mx-auto mb-4"></div>
            <div className="text-gray-500">Validating invitation...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="p-8 max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600 text-center">✅ Account Created!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-gray-600">
              Welcome to Rhythm90.io! Your account has been successfully created.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting you to login in 3 seconds...
            </p>
            <Link to="/login">
              <Button className="w-full">Continue to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!validation?.valid) {
    return (
      <div className="p-8 max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600 text-center">❌ Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-gray-600">{validation?.message}</p>
            <div className="space-y-2">
              <Link to="/">
                <Button variant="outline" className="w-full">Return to Home</Button>
              </Link>
              <Link to="/login">
                <Button className="w-full">Go to Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Create Your Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-gray-600">
              You've been invited to join Rhythm90.io
            </p>
            <p className="text-sm text-gray-500">
              Email: <strong>{validation.email}</strong>
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Name
            </label>
            <Input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && acceptInvite()}
              className="w-full"
            />
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              By creating your account, you'll be able to access Rhythm90.io and start managing your marketing operations. You'll log in using Google or Microsoft OAuth.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={acceptInvite} 
              disabled={accepting || !name.trim()}
              className="w-full"
            >
              {accepting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
            
            <Link to="/">
              <Button variant="outline" className="w-full">Cancel</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 