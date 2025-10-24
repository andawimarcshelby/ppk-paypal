import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TwoFactorSetup from "./security/TwoFactorSetup";

// Layout & guards
import AppShell from "./layout/AppShell";
import RequireAuth from "./auth/RequireAuth";

// 2FA during-login challenge screen
import TwoFactorChallenge from "./auth/TwoFactorChallenge";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Two-factor challenge flow during login */}
        <Route path="/2fa-challenge" element={<TwoFactorChallenge />} />

        {/* Authenticated area */}
        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/security/2fa" element={<TwoFactorSetup />} />
        </Route>

        {/* Default */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
