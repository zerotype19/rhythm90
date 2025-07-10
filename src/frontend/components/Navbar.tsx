import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { ThemeToggle } from "./ui/theme-toggle";
import { NotificationDropdown } from "./ui/notification-dropdown";
import { useAdmin } from "../contexts/AdminContext";
import { useDemo } from "../contexts/DemoContext";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useAnnouncements } from "../hooks/useAnnouncements";
import AnnouncementModal from "./AnnouncementModal";
import { cn } from "../lib/utils";

export default function Navbar() {
  const { isAdmin, loading } = useAdmin();
  const { isDemoMode } = useDemo();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const { hasUnreadAnnouncement, latestAnnouncement, markAsRead } = useAnnouncements();

  // Determine if user is logged in based on route
  const isLoggedInRoute = [
    '/dashboard', '/admin', '/team', '/workshop', '/analytics', 
    '/integrations', '/settings', '/developer', '/training', 
    '/public-api', '/enterprise', '/referrals', '/rnr-summary', '/changelog'
  ].some(route => location.pathname.startsWith(route));

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleAnnouncementClick = () => {
    setIsAnnouncementModalOpen(true);
  };

  const handleAnnouncementClose = () => {
    setIsAnnouncementModalOpen(false);
  };

  const handleMarkAsRead = (announcementId: string) => {
    markAsRead(announcementId);
  };

  // Public navigation items
  const publicNavigationItems = [
    { to: "/", label: "Home" },
    { to: "/marketing", label: "Product" },
    { to: "/pricing", label: "Pricing" },
    { to: "/help", label: "Help" },
  ];

  // Logged-in navigation items
  const loggedInNavigationItems = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/team", label: "Team" },
    { to: "/workshop", label: "Workshop" },
    { to: "/analytics", label: "Analytics" },
    { to: "/integrations", label: "Integrations" },
  ];

  const adminItems = [
    { to: "/admin", label: "Admin Dashboard" },
    { to: "/admin/invite", label: "Send Invites" },
  ];

  const profileItems = [
    { to: "/settings", label: "Settings", icon: "⚙️" },
    { to: "/logout", label: "Logout", icon: "🚪" },
  ];

  return (
    <>
      <nav className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-foreground" onClick={closeMobileMenu}>
              Rhythm90.io
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              {isDemoMode && (
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  DEMO MODE
                </Badge>
              )}
              
              {/* Main Navigation - Public or Logged-in */}
              {(isLoggedInRoute ? loggedInNavigationItems : publicNavigationItems).map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-muted-foreground hover:text-foreground transition-colors relative"
                >
                  {item.label}
                </Link>
              ))}

              {/* Login button for public pages */}
              {!isLoggedInRoute && (
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
              )}
            </div>

            {/* Right side items */}
            <div className="flex items-center space-x-2">
              {/* Announcement Badge - only for logged-in users */}
              {isLoggedInRoute && hasUnreadAnnouncement && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAnnouncementClick}
                  className="relative p-2 hover:bg-muted rounded-full transition-all"
                >
                  <span className="text-lg">🎉</span>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </Button>
              )}

              {/* Notifications - only for logged-in users */}
              {isLoggedInRoute && <NotificationDropdown />}

              {/* Profile Dropdown - only for logged-in users */}
              {isLoggedInRoute && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-2"
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                      U
                    </div>
                    <span className="hidden md:block text-sm">User</span>
                  </Button>
                  
                  {/* Profile Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-50">
                      <div className="py-1">
                        {profileItems.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <span className="mr-2">{item.icon}</span>
                            {item.label}
                          </Link>
                        ))}
                        <div className="border-t border-border my-1"></div>
                        <div className="px-4 py-2">
                          <ThemeToggle />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Theme Toggle - for public pages */}
              {!isLoggedInRoute && <ThemeToggle />}

              {/* Admin Dropdown - only for admin users */}
              {isLoggedInRoute && !loading && isAdmin && (
                <div className="relative group">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                    Admin ▼
                  </Button>
                  <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {adminItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile menu button */}
              <div className="lg:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-foreground"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-out Navigation */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        isMobileMenuOpen ? "block" : "hidden"
      )}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={closeMobileMenu}
        />
        
        {/* Slide-out Menu */}
        <div className="absolute left-0 top-0 h-full w-80 max-w-[80vw] bg-background border-r border-border shadow-xl transform transition-transform duration-300 ease-in-out">
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Menu</h2>
              <Button variant="ghost" size="sm" onClick={closeMobileMenu}>
                ✕
              </Button>
            </div>

            {/* Mobile Navigation */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-1">
                {isDemoMode && (
                  <div className="px-3 py-2 mb-4">
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      DEMO MODE
                    </Badge>
                  </div>
                )}
                
                {/* Main Navigation Items */}
                {(isLoggedInRoute ? loggedInNavigationItems : publicNavigationItems).map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <span className="flex-1">{item.label}</span>
                  </Link>
                ))}

                {/* Login button for public pages */}
                {!isLoggedInRoute && (
                  <Link
                    to="/login"
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-primary/10 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <span className="flex-1">Login</span>
                  </Link>
                )}

                {/* Admin Section - only for logged-in admin users */}
                {isLoggedInRoute && !loading && isAdmin && (
                  <div className="border-t border-border pt-4 mt-4">
                    <div className="px-3 py-2 text-sm font-semibold text-muted-foreground">
                      Admin
                    </div>
                    {adminItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="block px-6 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        onClick={closeMobileMenu}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Profile Section - only for logged-in users */}
                {isLoggedInRoute && (
                  <div className="border-t border-border pt-4 mt-4">
                    <div className="px-3 py-2 text-sm font-semibold text-muted-foreground">
                      Profile
                    </div>
                    {profileItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="flex items-center px-6 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        onClick={closeMobileMenu}
                      >
                        <span className="mr-2">{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                    <div className="px-6 py-2">
                      <ThemeToggle />
                    </div>
                  </div>
                )}

                {/* Mobile Announcement Badge - only for logged-in users */}
                {isLoggedInRoute && hasUnreadAnnouncement && (
                  <div className="border-t border-border pt-4 mt-4">
                    <button
                      onClick={() => {
                        handleAnnouncementClick();
                        closeMobileMenu();
                      }}
                      className="flex items-center px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors w-full"
                    >
                      <span className="mr-2">🎉</span>
                      What's New
                      <div className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Announcement Modal */}
      <AnnouncementModal
        isOpen={isAnnouncementModalOpen}
        onClose={handleAnnouncementClose}
        announcement={latestAnnouncement}
        onMarkAsRead={handleMarkAsRead}
      />
    </>
  );
} 