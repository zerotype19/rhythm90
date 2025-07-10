import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminProvider } from './contexts/AdminContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Team from './pages/Team';
import Training from './pages/Training';
import Login from './pages/Login';
import RnRSummary from './pages/RnRSummary';
import Admin from './pages/Admin';
import Invite from './pages/Invite';
import AcceptInvite from './pages/AcceptInvite';

export default function App() {
  return (
    <AdminProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-rhythmWhite font-sans">
          <Navbar />
          <main className="flex-grow container mx-auto p-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/team" element={<Team />} />
              <Route path="/training" element={<Training />} />
              <Route path="/login" element={<Login />} />
              <Route path="/rnr-summary" element={<RnRSummary />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/invite" element={<Invite />} />
              <Route path="/accept-invite" element={<AcceptInvite />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AdminProvider>
  );
}
