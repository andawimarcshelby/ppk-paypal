import { FormEvent, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, setToken } from "../api/client";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("jane@example.com");
  const [password, setPassword] = useState("Password1");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // If a token is already stored, bounce to dashboard
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) navigate("/dashboard", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setErr(null);
    setBusy(true);

    try {
      // Try password-only login first.
      const data = await login({ email, password });

      // If backend returns a token directly (no 2FA required)
      if (data?.token) {
        setToken(data.token);
        navigate("/dashboard", { replace: true });
        return;
      }

      // Fallback: if we got here without token, treat as unexpected
      setErr("Unexpected response from server.");
    } catch (error: any) {
      const status = error?.response?.status;

      // Our API uses 409 to indicate "2FA required"
      if (status === 409) {
        setErr("Two-factor code required.");
        navigate("/2fa-challenge", {
          replace: true,
          state: { email, password },
        });
      } else if (status === 422 || status === 401) {
        setErr("Invalid email or password.");
      } else {
        setErr("Unexpected response from server.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-lg font-semibold mb-4">Sign in</h1>

        {err && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded border px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded border px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded bg-indigo-600 hover:bg-indigo-700 text-white py-2 transition disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-3 text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="text-indigo-600 hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
