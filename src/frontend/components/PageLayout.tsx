import type { ReactNode } from "react";
import Navbar from "./Navbar";

interface PageLayoutProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "5xl" | "6xl" | "7xl";
  className?: string;
}

export default function PageLayout({ children, maxWidth = "7xl", className = "" }: PageLayoutProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl"
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Navbar />
      
      {/* Main Content */}
      <main className={`flex-1 mx-auto w-full px-4 sm:px-6 lg:px-8 ${maxWidthClasses[maxWidth]} ${className}`}>
        {children}
      </main>
      
      {/* Footer */}
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
    </div>
  );
} 