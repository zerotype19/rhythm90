import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { cn } from "../lib/utils";

interface SidebarItem {
  to: string;
  label: string;
  icon?: string;
  badge?: string;
}

interface SidebarProps {
  items: SidebarItem[];
  title: string;
  className?: string;
}

export default function Sidebar({ items, title, className = "" }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className={cn("font-semibold text-foreground", isCollapsed ? "sr-only" : "")}>
          {title}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="shrink-0"
        >
          {isCollapsed ? "→" : "←"}
        </Button>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {items.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {item.icon && (
                <span className={cn("mr-3", isCollapsed ? "mr-0" : "")}>
                  {item.icon}
                </span>
              )}
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 