import { useAuth } from "../hooks/useAuth";
import { useDemo } from "../contexts/DemoContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { trackEvent, AnalyticsEvents } from "../hooks/useAnalytics";

export default function Login() {
  const { loginGoogle, loginMicrosoft } = useAuth();
  const { isDemoMode, loginAsDemo } = useDemo();

  const handleDemoLogin = async () => {
    await loginAsDemo();
    trackEvent(AnalyticsEvents.DEMO_LOGIN);
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Welcome to Rhythm90.io</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={loginGoogle} 
            className="w-full"
            variant="outline"
          >
            Login with Google
          </Button>
          
          <Button 
            onClick={loginMicrosoft} 
            className="w-full"
            variant="outline"
          >
            Login with Microsoft
          </Button>

          {isDemoMode && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>
              
              <Button 
                onClick={handleDemoLogin}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-yellow-900"
              >
                Try Demo Mode
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                Demo mode allows you to explore the app without creating an account
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 