import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AdminProvider } from "./contexts/AdminContext";
import { DemoProvider } from "./contexts/DemoContext";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import UserSettings from "./pages/UserSettings";
import Developer from "./pages/Developer";
import Team from "./pages/Team";
import Workshop from "./pages/Workshop";
import Analytics from "./pages/Analytics";
import Integrations from "./pages/Integrations";
import Enterprise from "./pages/Enterprise";
import Referrals from "./pages/Referrals";
import RnRSummary from "./pages/RnRSummary";
import Changelog from "./pages/Changelog";
import Pricing from "./pages/Pricing";
import Help from "./pages/Help";
import Marketing from "./pages/Marketing";
import Training from "./pages/Training";
import PublicApi from "./pages/PublicApi";
import Invite from "./pages/Invite";
import AcceptInvite from "./pages/AcceptInvite";
import RequestPasswordReset from "./pages/RequestPasswordReset";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <DemoProvider>
      <AdminProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/help" element={<Help />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/invite" element={<Invite />} />
            <Route path="/accept-invite" element={<AcceptInvite />} />
            <Route path="/request-password-reset" element={<RequestPasswordReset />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* App Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="/settings" element={<UserSettings />} />
            <Route path="/settings/*" element={<UserSettings />} />
            <Route path="/developer" element={<Developer />} />
            <Route path="/developer/*" element={<Developer />} />
            <Route path="/team" element={<Team />} />
            <Route path="/workshop" element={<Workshop />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/enterprise" element={<Enterprise />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/rnr-summary" element={<RnRSummary />} />
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/training" element={<Training />} />
            <Route path="/public-api" element={<PublicApi />} />
          </Routes>
        </Router>
      </AdminProvider>
    </DemoProvider>
  );
}

export default App;
