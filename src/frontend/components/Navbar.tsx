import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
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

  // --- Dynamic route checks for feature links ---
  const [hasAnalytics, setHasAnalytics] = useState(false);
  const [hasDeveloper, setHasDeveloper] = useState(false);
  const [hasHelp, setHasHelp] = useState(false);
  // Billing: no route, but keep logic for admin only

  useEffect(() => {
    // Check if routes exist by looking for window.__RHYTHM90_ROUTES__ (or fallback to hardcoded)
    // In a real app, you might want to check router config or use a context
    setHasAnalytics(!!window.location.pathname.match(/^\/analytics/));
    setHasDeveloper(!!window.location.pathname.match(/^\/developer/));
    setHasHelp(!!window.location.pathname.match(/^\/help/));
    // For now, just set to true if file exists (from audit)
    setHasAnalytics(true);
    setHasDeveloper(true);
    setHasHelp(true);
  }, []);

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

  // --- Main nav items ---
  const loggedInNavigationItems = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/team", label: "Team" },
    { to: "/workshop", label: "Workshop" },
    hasAnalytics ? { to: "/analytics", label: "Analytics" } : null,
    isAdmin ? { to: "/admin", label: "Admin" } : null,
  ].filter(Boolean);

  // --- Profile dropdown items ---
  const profileItems = [
    { to: "/settings", label: "Settings", icon: "⚙️" },
    hasDeveloper ? { to: "/developer", label: "API Keys", icon: "🔑" } : null,
    (isAdmin) ? { to: "/billing", label: "Billing", icon: "💳" } : null, // Placeholder, no route yet
    hasHelp ? { to: "/help", label: "Help", icon: "❓" } : { to: "https://rhythm90.io/support", label: "Help", icon: "❓", external: true },
    { to: "/logout", label: "Logout", icon: "🚪", action: handleLogout },
  ].filter(Boolean);

  // --- Admin dropdown grouping ---
  const adminDropdownItems = [
    { to: "/admin", label: "Admin Dashboard", icon: "🛠️" },
    { to: "/admin/invite", label: "Send Invites", icon: "✉️" },
  ];
  const [showAdminSection, setShowAdminSection] = useState(false);

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
              <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
                BETA
              </Badge>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2"
              aria-label="Open menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              {isDemoMode && (
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  DEMO MODE
                </Badge>
              )}
              {/* Main Navigation - Logged-in only */}
              {isAuthenticated && loggedInNavigationItems
                .filter((item): item is NonNullable<typeof item> => Boolean(item))
                .map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="text-muted-foreground hover:text-foreground transition-colors relative"
                  >
                    {item.label}
                  </Link>
                ))}
              {/* Main Navigation - Public only */}
              {!isAuthenticated && publicNavigationItems.map((item) => (
                item ? (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="text-muted-foreground hover:text-foreground transition-colors relative"
                  >
                    {item.label}
                  </Link>
                ) : null
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

              {/* Notifications - always for logged-in users */}
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
                    <div className="absolute right-0 mt-2 w-64 bg-background border border-border rounded-md shadow-lg z-50">
                      <div className="py-2 px-4 border-b border-border">
                        <div className="font-semibold text-base">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                        {/* Connected Providers */}
                        {user.providers && user.providers.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {user.providers.map((provider) => (
                              <span key={provider} className="inline-block bg-gray-100 dark:bg-gray-800 text-xs px-2 py-1 rounded">
                                {provider.charAt(0).toUpperCase() + provider.slice(1)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="py-1">
                        {profileItems.map((item) => (
                          item ? (
                            item.action ? (
                              <button
                                key={item.to}
                                onClick={item.action}
                                className="flex items-center w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                              >
                                <span className="mr-2">{item.icon}</span>
                                {item.label}
                              </button>
                            ) : item.external ? (
                              <a
                                key={item.to}
                                href={item.to}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                                onClick={() => setIsProfileDropdownOpen(false)}
                              >
                                <span className="mr-2">{item.icon}</span>
                                {item.label}
                              </a>
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
                          ) : null
                        ))}
                      </div>
                      {/* Admin Section in Dropdown */}
                      {isAdmin && (
                        <>
                          <div className="border-t border-border my-1"></div>
                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                            onClick={() => setShowAdminSection((v) => !v)}
                          >
                            <span className="mr-2">🛠️</span>
                            <span>Admin</span>
                            <span className="ml-auto">{showAdminSection ? '▲' : '▼'}</span>
                          </button>
                          {showAdminSection && (
                            <div className="pl-6">
                              {adminDropdownItems.map((item) => (
                                item ? (
                                  <Link
                                    key={item.to}
                                    to={item.to}
                                    className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                  >
                                    <span className="mr-2">{item.icon}</span>
                                    {item.label}
                                  </Link>
                                ) : null
                              ))}
                            </div>
                          )}
                        </>
                      )}
                      <div className="border-t border-border my-1"></div>
                      <div className="px-4 py-2">
                        <ThemeToggle />
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                {(isAuthenticated ? loggedInNavigationItems : publicNavigationItems)
                  .filter((item): item is NonNullable<typeof item> => Boolean(item))
                  .map((item) => (
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
                    {adminDropdownItems
                      .filter((item): item is NonNullable<typeof item> => Boolean(item))
                      .map((item) => (
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
                    {profileItems
                      .filter((item): item is NonNullable<typeof item> => Boolean(item))
                      .map((item) => (
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
      {isAnnouncementModalOpen && (
        <AnnouncementModal
          isOpen={isAnnouncementModalOpen}
          announcement={latestAnnouncement}
          onClose={handleAnnouncementClose}
          onMarkAsRead={handleMarkAsRead}
        />
      )}
    </>
  );
} 