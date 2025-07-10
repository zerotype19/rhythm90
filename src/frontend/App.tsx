import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AdminProvider } from './contexts/AdminContext';
import { DemoProvider } from './contexts/DemoContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Team from './pages/Team';
import Training from './pages/Training';
import Login from './pages/Login';
import RnRSummary from './pages/RnRSummary';
import Admin from './pages/Admin';
import Invite from './pages/Invite';
import AcceptInvite from './pages/AcceptInvite';
import UserSettings from './pages/UserSettings';
import RequestPasswordReset from './pages/RequestPasswordReset';
import ResetPassword from './pages/ResetPassword';
import Pricing from './pages/Pricing';
import Help from './pages/Help';
import Marketing from "./pages/Marketing";
import Changelog from './pages/Changelog';
import Workshop from './pages/Workshop';
import Analytics from './pages/Analytics';
import PublicApi from './pages/PublicApi';
import Developer from './pages/Developer';
import { trackEvent, AnalyticsEvents } from './hooks/useAnalytics';
import { useOnboarding } from './hooks/useOnboarding';
import OnboardingTour from './components/OnboardingTour';

// Component to track page views
function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    trackEvent(AnalyticsEvents.PAGE_VIEW, { 
      path: location.pathname,
      search: location.search 
    });
  }, [location]);

  return null;
}

function AppContent() {
  const { showTour, completeTour, skipTour } = useOnboarding();

  return (
    <div className="flex flex-col min-h-screen bg-rhythmWhite font-sans">
      <Navbar />
      <main className="flex-grow container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/team" element={<Team />} />
          <Route path="/training" element={<Training />} />
          <Route path="/workshop" element={<Workshop />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/public-api" element={<PublicApi />} />
          <Route path="/developer" element={<Developer />} />
          <Route path="/login" element={<Login />} />
          <Route path="/rnr-summary" element={<RnRSummary />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/invite" element={<Invite />} />
          <Route path="/accept-invite" element={<AcceptInvite />} />
          <Route path="/settings" element={<UserSettings />} />
          <Route path="/help" element={<Help />} />
          <Route path="/request-password-reset" element={<RequestPasswordReset />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/marketing" element={<Marketing />} />
          <Route path="/product" element={<Marketing />} />
          <Route path="/changelog" element={<Changelog />} />
        </Routes>
      </main>
      <Footer />
      <OnboardingTour 
        isVisible={showTour}
        onComplete={completeTour}
        onSkip={skipTour}
      />
    </div>
  );
}

export default function App() {
  return (
    <DemoProvider>
      <AdminProvider>
        <Router>
          <PageTracker />
          <AppContent />
        </Router>
      </AdminProvider>
    </DemoProvider>
  );
}
