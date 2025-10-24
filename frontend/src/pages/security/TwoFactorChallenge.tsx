// frontend/src/pages/security/TwoFactorChallenge.tsx
import { FormEvent, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, setToken } from "../../api/client";

type SavedPayload = { email: string; password: string };

export default function TwoFactorChallenge() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<SavedPayload | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("ppk_login_payload");
    if (raw) {
      try {
        setSaved(JSON.parse(raw));
      } catch {
        // ignore
      }
    }
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!saved) {
      setError("Missing login context, please sign in again.");
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code.");
      return;
    }

    setError(null);
    setBusy(true);

    try {
      const data: any = await login({
        email: saved.email,
        password: saved.password,
        code,
      });

      if (data?.token) {
        // success 🎉
        sessionStorage.removeItem("ppk_login_payload");
        setToken(data.token);
        navigate("/dashboard", { replace: true });
        return;
      }

      setError(data?.message || "Verification failed.");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Verification failed.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  if (!saved) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-[420px] rounded-md border p-6 bg-white">
          <div className="text-sm">
            No pending login found.{" "}
            <Link className="text-indigo-600 underline" to="/login">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-[420px] rounded-md border p-6 bg-white">
        <h1 className="text-lg font-semibold mb-4">Two-Factor Code</h1>

        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 text-red-700 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <p className="text-sm text-gray-600">
            Enter the 6-digit code from your authenticator app for{" "}
            <span className="font-medium">{saved.email}</span>.
          </p>

          <input
            className="w-full border rounded px-3 py-2 text-sm tracking-widest"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            autoFocus
          />

          <button
            className="w-full rounded bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-sm disabled:opacity-60"
            disabled={busy}
            type="submit"
          >
            {busy ? "Verifying..." : "Verify"}
          </button>

          <div className="text-xs text-gray-500">
            <Link className="text-indigo-600 underline" to="/login">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
