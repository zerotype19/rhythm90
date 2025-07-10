import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="text-center py-20">
      <h1 className="text-5xl font-extrabold text-rhythmRed mb-4">Welcome to Rhythm90.io</h1>
      <p className="text-lg text-rhythmGray mb-8">Your team’s digital toolbox to run smarter marketing quarters.</p>
      <Link to="/dashboard" className="bg-rhythmRed text-white px-6 py-3 rounded shadow hover:bg-red-700 transition">
        Go to Dashboard
      </Link>
    </div>
  );
} 