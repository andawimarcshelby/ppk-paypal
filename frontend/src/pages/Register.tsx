import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile_number: "",
    password: "",
    password_confirmation: "",
  });

  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await register(form);
      nav("/dashboard");
    } catch (e: any) {
      const apiErr =
        e?.response?.data?.message ??
        e?.response?.data?.errors
          ? JSON.stringify(e.response.data.errors)
          : "Registration failed";
      setErr(apiErr);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="card max-w-md w-full">
        <h1 className="text-2xl font-semibold mb-1 text-primary2">Create account</h1>
        <p className="text-subink mb-6">Sign up to get started</p>

        {err && (
          <div className="mb-4 rounded-xl2 bg-red-50 text-red-700 px-3 py-2">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <div className="label">Full name</div>
            <input
              className="input"
              value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)}
              required
            />
          </label>

          <label className="block">
            <div className="label">Email</div>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
            />
          </label>

          <label className="block">
            <div className="label">Mobile number</div>
            <input
              className="input"
              value={form.mobile_number}
              onChange={(e) => set("mobile_number", e.target.value)}
              required
            />
          </label>

          <label className="block">
            <div className="label">Password</div>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              required
            />
          </label>

          <label className="block">
            <div className="label">Confirm password</div>
            <input
              className="input"
              type="password"
              value={form.password_confirmation}
              onChange={(e) => set("password_confirmation", e.target.value)}
              required
            />
          </label>

          <button className="btn w-full" disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-sm text-subink">
          Already have an account?{" "}
          <Link to="/login" className="link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
