import type { ReactNode } from "react";
import { cn } from "../lib/utils";

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
    <div className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${maxWidthClasses[maxWidth]} ${className}`}>
      {children}
    </div>
  );
} 