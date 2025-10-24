import { NavLink, Outlet } from "react-router-dom";

export default function AppShell() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <div className="font-semibold">ppk-paypal</div>
          <nav className="flex gap-4 text-sm">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-2 py-1 rounded ${isActive ? "bg-gray-100" : ""}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/security/2fa"
              className={({ isActive }) =>
                `px-2 py-1 rounded ${isActive ? "bg-gray-100" : ""}`
              }
            >
              2FA
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
