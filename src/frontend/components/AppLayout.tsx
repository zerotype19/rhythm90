import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import PageLayout from "./PageLayout";

interface AppLayoutProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "5xl" | "6xl" | "7xl";
  className?: string;
  showFooter?: boolean;
}

export default function AppLayout({ 
  children, 
  maxWidth = "7xl", 
  className = "",
  showFooter = true 
}: AppLayoutProps) {
  const location = useLocation();
  
  // Route-based detection for logged-in state
  const isLoggedInRoute = [
    '/dashboard', '/admin', '/team', '/workshop', '/analytics', 
    '/integrations', '/settings', '/developer', '/training', 
    '/public-api', '/enterprise', '/referrals', '/rnr-summary', '/changelog'
  ].some(route => location.pathname.startsWith(route));
  
  const isAuthenticated = isLoggedInRoute;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Navbar />
      
      {/* Main Content */}
      <main className="flex-1">
        <PageLayout maxWidth={maxWidth} className={className}>
          {children}
        </PageLayout>
      </main>
      
      {/* Footer - only show if enabled and on public pages */}
      {showFooter && !isAuthenticated && (
        <footer className="border-t border-border bg-background py-6 mt-auto">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="text-sm text-muted-foreground">
                © 2024 Rhythm90.io. Built for modern marketing teams.
              </div>
              <div className="flex space-x-6 text-sm text-muted-foreground">
                <a href="/help" className="hover:text-foreground transition-colors">
                  Help
                </a>
                <a href="/pricing" className="hover:text-foreground transition-colors">
                  Pricing
                </a>
                <a href="mailto:support@rhythm90.io" className="hover:text-foreground transition-colors">
                  Support
                </a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
} 