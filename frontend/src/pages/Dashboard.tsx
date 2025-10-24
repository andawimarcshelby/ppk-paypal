import { Link } from "react-router-dom";
import { logout, me } from "../api/client";
import { useEffect, useState } from "react";

type User = {
  id: number;
  full_name?: string;
  email: string;
  two_factor_enabled?: boolean;
};

export default function Dashboard() {
  const [u, setU] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await me();
        setU(data);
      } catch {
        // ignore
      }
    })();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="bg-white rounded-2xl shadow p-6">
          <h1 className="text-xl font-semibold mb-2">Dashboard</h1>
          <p className="text-sm text-slate-600">
            Hello{u?.full_name ? `, ${u.full_name}` : ""}! You’re signed in as{" "}
            <strong>{u?.email}</strong>.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-between">
          <div>
            <div className="font-medium">Two-Factor Authentication</div>
            <div className="text-sm text-slate-600">
              Status: {u?.two_factor_enabled ? "Enabled" : "Disabled"}
            </div>
          </div>
          <Link
            to="/security/2fa"
            className="rounded-lg bg-indigo-600 text-white px-4 py-2"
          >
            Manage 2FA
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <button
            className="rounded-lg border px-4 py-2"
            onClick={async () => {
              await logout();
              window.location.href = "/login";
            }}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
