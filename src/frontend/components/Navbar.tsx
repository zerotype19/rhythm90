import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-rhythmBlack text-rhythmWhite">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link to="/" className="text-2xl font-bold">Rhythm90.io</Link>
        <div className="space-x-4">
          <Link to="/dashboard" className="hover:text-rhythmRed">Dashboard</Link>
          <Link to="/team" className="hover:text-rhythmRed">Team</Link>
          <Link to="/training" className="hover:text-rhythmRed">Training</Link>
          <Link to="/login" className="hover:text-rhythmRed">Login</Link>
        </div>
      </div>
    </nav>
  );
} 