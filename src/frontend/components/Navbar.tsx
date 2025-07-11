import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { ThemeToggle } from "./ui/theme-toggle";
import { NotificationDropdown } from "./ui/notification-dropdown";
import { useAdmin } from "../contexts/AdminContext";
import { useDemo } from "../contexts/DemoContext";
import { useAuth } from "../hooks/useAuth";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useAnnouncements } from "../hooks/useAnnouncements";
import AnnouncementModal from "./AnnouncementModal";
import { cn } from "../lib/utils";

export default function Navbar() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { isDemoMode } = useDemo();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  console.log('[NAVBAR] Auth State:', isAuthenticated, user);
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const { hasUnreadAnnouncement, latestAnnouncement, markAsRead } = useAnnouncements();

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

  const handleLogout = async () => {
    await logout();
    setIsProfileDropdownOpen(false);
    closeMobileMenu();
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
  ];

  const adminItems = [
    { to: "/admin", label: "Admin Dashboard" },
    { to: "/admin/invite", label: "Send Invites" },
  ];

  const profileItems = [
    { to: "/settings", label: "Settings", icon: "⚙️" },
    { to: "/logout", label: "Logout", icon: "🚪", action: handleLogout },
  ];

  // Don't render until auth is loaded
  if (authLoading) {
    return (
      <nav className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold text-foreground">Rhythm90.io</div>
            <div className="animate-pulse bg-muted h-4 w-24 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

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
              {(isAuthenticated ? loggedInNavigationItems : publicNavigationItems).map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-muted-foreground hover:text-foreground transition-colors relative"
                >
                  {item.label}
                </Link>
              ))}

              {/* Login button for public pages */}
              {!isAuthenticated && (
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
              {isAuthenticated && hasUnreadAnnouncement && (
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
              {isAuthenticated && <NotificationDropdown />}

              {/* Profile Dropdown - only for logged-in users */}
              {isAuthenticated && user && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-2"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                        {user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0,2)}
                      </div>
                    )}
                    <span className="hidden md:block text-sm">{user.name}</span>
                  </Button>
                  {/* Profile Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-md shadow-lg z-50">
                      <div className="py-1">
                        {profileItems.map((item) => (
                          item.action ? (
                            <button
                              key={item.to}
                              onClick={item.action}
                              className="flex items-center w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                              <span className="mr-2">{item.icon}</span>
                              {item.label}
                            </button>
                          ) : (
                            <Link
                              key={item.to}
                              to={item.to}
                              className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                              onClick={() => setIsProfileDropdownOpen(false)}
                            >
                              <span className="mr-2">{item.icon}</span>
                              {item.label}
                            </Link>
                          )
                        ))}
                        <div className="border-t border-border my-1"></div>
                        <div className="px-4 py-2">
                          <ThemeToggle />
                        </div>
                        {/* Connected Accounts */}
                        {user.providers && user.providers.length > 0 && (
                          <div className="px-4 py-2 border-t border-border mt-1">
                            <div className="text-xs text-muted-foreground mb-1">Connected Accounts</div>
                            <div className="flex flex-wrap gap-2">
                              {user.providers.map((provider) => (
                                <span key={provider} className="inline-block bg-gray-100 dark:bg-gray-800 text-xs px-2 py-1 rounded">
                                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Theme Toggle - for public pages */}
              {!isAuthenticated && <ThemeToggle />}

              {/* Admin Dropdown - only for admin users */}
              {isAuthenticated && !adminLoading && isAdmin && (
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
          className="absolute inset-0 bg-black/50"
          onClick={closeMobileMenu}
        />
        
        {/* Slide-out Menu */}
        <div className="absolute left-0 top-0 h-full w-80 max-w-[80vw] bg-white dark:bg-[#0f172a] border-r border-border shadow-xl transform transition-transform duration-300 ease-in-out">
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-white dark:bg-[#0f172a]">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={closeMobileMenu}
                className="text-gray-900 dark:text-white hover:opacity-75 hover:scale-105 transition-all"
              >
                ✕
              </Button>
            </div>

            {/* Mobile Navigation */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0f172a]">
              <div className="p-4 space-y-1">
                {isDemoMode && (
                  <div className="px-3 py-2 mb-4">
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      DEMO MODE
                    </Badge>
                  </div>
                )}
                
                {/* Main Navigation Items */}
                {(isAuthenticated ? loggedInNavigationItems : publicNavigationItems).map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <span className="flex-1">{item.label}</span>
                  </Link>
                ))}

                {/* Login button for public pages */}
                {!isAuthenticated && (
                  <Link
                    to="/login"
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-400/10 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <span className="flex-1">Login</span>
                  </Link>
                )}

                {/* Admin Section - only for logged-in admin users */}
                {isAuthenticated && !adminLoading && isAdmin && (
                  <div className="border-t border-gray-200 dark:border-white/20 pt-4 mt-4">
                    <div className="px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white">
                      Admin
                    </div>
                    {adminItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="block px-6 py-2 text-sm text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                        onClick={closeMobileMenu}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Profile Section - only for logged-in users */}
                {isAuthenticated && user && (
                  <div className="border-t border-gray-200 dark:border-white/20 pt-4 mt-4">
                    <div className="px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white">
                      Profile
                    </div>
                    {profileItems.map((item) => (
                      item.action ? (
                        <button
                          key={item.to}
                          onClick={() => {
                            item.action();
                            closeMobileMenu();
                          }}
                          className="flex items-center w-full px-6 py-2 text-sm text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                        >
                          <span className="mr-2">{item.icon}</span>
                          {item.label}
                        </button>
                      ) : (
                        <Link
                          key={item.to}
                          to={item.to}
                          className="flex items-center px-6 py-2 text-sm text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                          onClick={closeMobileMenu}
                        >
                          <span className="mr-2">{item.icon}</span>
                          {item.label}
                        </Link>
                      )
                    ))}
                    <div className="px-6 py-2">
                      <ThemeToggle />
                    </div>
                  </div>
                )}

                {/* Mobile Announcement Badge - only for logged-in users */}
                {isAuthenticated && hasUnreadAnnouncement && (
                  <div className="border-t border-gray-200 dark:border-white/20 pt-4 mt-4">
                    <button
                      onClick={() => {
                        handleAnnouncementClick();
                        closeMobileMenu();
                      }}
                      className="flex items-center px-3 py-2 text-sm text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors w-full"
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