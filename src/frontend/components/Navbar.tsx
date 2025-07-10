import { Link } from "react-router-dom";
import { useState } from "react";
import { ThemeToggle } from "./ui/theme-toggle";
import { NotificationDropdown } from "./ui/notification-dropdown";
import { useAdmin } from "../contexts/AdminContext";
import { useDemo } from "../contexts/DemoContext";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export default function Navbar() {
  const { isAdmin, loading } = useAdmin();
  const { isDemoMode } = useDemo();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/product", label: "Product" },
    { to: "/team", label: "Team" },
    { to: "/training", label: "Training" },
    { to: "/workshop", label: "Workshop" },
    { to: "/analytics", label: "Analytics" },
    { to: "/public-api", label: "API" },
    { to: "/developer", label: "Developer" },
    { to: "/enterprise", label: "Enterprise" },
    { to: "/integrations", label: "Integrations" },
    { to: "/referrals", label: "Referrals" },
    { to: "/rnr-summary", label: "R&R Summary" },
    { to: "/help", label: "Help" },
    { to: "/changelog", label: "Changelog", badge: "🆕" },
  ];

  const adminItems = [
    { to: "/admin", label: "Admin Dashboard" },
    { to: "/admin/invite", label: "Send Invites" },
  ];

  const settingsItems = [
    { to: "/settings", label: "User Settings" },
    { to: "/team", label: "Team Management" },
  ];

  return (
    <nav className="bg-rhythmBlack text-rhythmWhite sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold" onClick={closeMobileMenu}>
            Rhythm90.io
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {isDemoMode && (
              <span className="bg-yellow-500 text-yellow-900 px-2 py-1 rounded text-xs font-semibold">
                DEMO MODE
              </span>
            )}
            
            {/* Main Navigation */}
            {navigationItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="hover:text-rhythmRed transition-colors relative"
              >
                {item.label}
                {item.badge && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full animate-pulse">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}

            {/* Admin Dropdown */}
            {!loading && isAdmin && (
              <div className="relative group">
                <button className="hover:text-rhythmRed transition-colors">
                  Admin ▼
                </button>
                <div className="absolute top-full left-0 bg-rhythmBlack border border-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-48">
                  {adminItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="block px-4 py-2 hover:bg-gray-800 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Dropdown */}
            <div className="relative group">
              <button className="hover:text-rhythmRed transition-colors">
                Settings ▼
              </button>
              <div className="absolute top-full left-0 bg-rhythmBlack border border-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-48">
                {settingsItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="block px-4 py-2 hover:bg-gray-800 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link to="/login" className="hover:text-rhythmRed transition-colors">
              Login
            </Link>
            
            <NotificationDropdown />
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <NotificationDropdown />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="text-rhythmWhite hover:text-rhythmRed"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {isDemoMode && (
                <div className="px-3 py-2">
                  <span className="bg-yellow-500 text-yellow-900 px-2 py-1 rounded text-xs font-semibold">
                    DEMO MODE
                  </span>
                </div>
              )}
              
              {navigationItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block px-3 py-2 rounded-md text-base font-medium hover:text-rhythmRed hover:bg-gray-800 transition-colors"
                  onClick={closeMobileMenu}
                >
                  {item.label}
                  {item.badge && (
                    <Badge className="ml-2 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full animate-pulse">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}

              {/* Admin Section */}
              {!loading && isAdmin && (
                <div className="border-t border-gray-700 pt-2 mt-2">
                  <div className="px-3 py-2 text-sm font-semibold text-gray-400">
                    Admin
                  </div>
                  {adminItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="block px-6 py-2 text-sm hover:text-rhythmRed hover:bg-gray-800 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}

              {/* Settings Section */}
              <div className="border-t border-gray-700 pt-2 mt-2">
                <div className="px-3 py-2 text-sm font-semibold text-gray-400">
                  Settings
                </div>
                {settingsItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="block px-6 py-2 text-sm hover:text-rhythmRed hover:bg-gray-800 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="border-t border-gray-700 pt-2 mt-2">
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:text-rhythmRed hover:bg-gray-800 transition-colors"
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 