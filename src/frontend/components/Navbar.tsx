import { Link } from "react-router-dom";
import { ThemeToggle } from "./ui/theme-toggle";
import { NotificationDropdown } from "./ui/notification-dropdown";
import { useAdmin } from "../contexts/AdminContext";
import { useDemo } from "../contexts/DemoContext";

export default function Navbar() {
  const { isAdmin, loading } = useAdmin();
  const { isDemoMode } = useDemo();

  return (
    <nav className="bg-rhythmBlack text-rhythmWhite">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link to="/" className="text-2xl font-bold">Rhythm90.io</Link>
        <div className="flex items-center space-x-4">
          {isDemoMode && (
            <span className="bg-yellow-500 text-yellow-900 px-2 py-1 rounded text-xs font-semibold">
              DEMO MODE
            </span>
          )}
          <Link to="/dashboard" className="hover:text-rhythmRed">Dashboard</Link>
          <Link to="/team" className="hover:text-rhythmRed">Team</Link>
          <Link to="/training" className="hover:text-rhythmRed">Training</Link>
          <Link to="/rnr-summary" className="hover:text-rhythmRed">R&R Summary</Link>
          {!loading && isAdmin && (
            <Link to="/admin" className="hover:text-rhythmRed">Admin</Link>
          )}
          <Link to="/login" className="hover:text-rhythmRed">Login</Link>
          <NotificationDropdown />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
} 