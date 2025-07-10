import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";

interface InviteValidation {
  valid: boolean;
  email?: string;
  message?: string;
}

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const [validation, setValidation] = useState<InviteValidation | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);

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
    if (!token) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/accept-invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (data.success) {
        setAccepted(true);
      } else {
        setValidation({ valid: false, message: data.message });
      }
    } catch (error) {
      setValidation({ valid: false, message: "Failed to accept invitation" });
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-md mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
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
            <CardTitle className="text-green-600">✅ Invitation Accepted!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Welcome to Rhythm90.io! Your invitation has been successfully accepted.
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
            <CardTitle className="text-red-600">❌ Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{validation?.message}</p>
            <Link to="/">
              <Button variant="outline" className="w-full">Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Accept Invitation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            You've been invited to join Rhythm90.io as <strong>{validation.email}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Click the button below to accept this invitation and create your account.
          </p>
          <Button onClick={acceptInvite} className="w-full">
            Accept Invitation
          </Button>
          <Link to="/">
            <Button variant="outline" className="w-full">Cancel</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
} 