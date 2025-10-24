import { useEffect, useState } from "react";
import { me, twoFaSetup, twoFaVerify, twoFaDisable } from "../api/client";
import { QRCodeSVG } from "qrcode.react";

type User = {
  id: number;
  email: string;
  full_name: string;
  two_factor_enabled?: boolean;
};

export default function TwoFactorSetup() {
  const [user, setUser] = useState<User | null>(null);
  const [secret, setSecret] = useState<string>("");
  const [otpauth, setOtpauth] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function refresh() {
    setErr(null);
    setMsg(null);
    try {
      const u = await me();
      setUser(u);
    } catch (e) {
      setErr("Network Error");
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function loadSetup() {
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      const data = await twoFaSetup();
      // backend may return { qr_svg?, otpauth_url?, secret }
      if (data?.otpauth_url) setOtpauth(data.otpauth_url);
      if (data?.secret) setSecret(data.secret);
      setMsg("Scan the QR then enter the 6-digit code.");
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to start 2FA setup.");
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      // ALWAYS send a STRING
      const data = await twoFaVerify(code.trim());
      setMsg(data?.message || "Two-factor authentication enabled.");
      await refresh();
      setCode("");
    } catch (e: any) {
      // typical Laravel validation shape
      const d = e?.response?.data;
      const m =
        d?.message ||
        (d?.errors?.code && Array.isArray(d.errors.code) && d.errors.code[0]) ||
        "Verification failed.";
      setErr(m);
    } finally {
      setLoading(false);
    }
  }

  async function disable2fa() {
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      const data = await twoFaDisable();
      setMsg(data?.message || "Two-factor authentication disabled.");
      setSecret("");
      setOtpauth("");
      await refresh();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to disable 2FA.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Two-Factor Authentication (2FA)</h2>

        {err && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        )}
        {msg && (
          <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {msg}
          </div>
        )}

        <p className="text-sm mb-3">
          Status:{" "}
          <span className={user?.two_factor_enabled ? "text-emerald-700" : "text-gray-700"}>
            {user?.two_factor_enabled ? "Enabled" : "Disabled"}
          </span>
        </p>

        {!user?.two_factor_enabled ? (
          <>
            <p className="text-sm mb-3">
              Scan this QR in Google Authenticator (or compatible), then enter the 6-digit code to verify.
            </p>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-36 h-36 flex items-center justify-center border rounded-lg">
                {otpauth ? (
                  <QRCodeSVG value={otpauth} width={140} height={140} />
                ) : (
                  <span className="text-xs text-gray-500">Loading QR…</span>
                )}
              </div>
              <div className="text-xs break-all">
                {secret && (
                  <>
                    <div className="text-gray-500">Secret:</div>
                    <div className="font-mono">{secret}</div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                // IMPORTANT: text + numeric IME, NOT number!
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => {
                  // keep only digits; keep as STRING to preserve leading zero
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setCode(v);
                }}
                className="border rounded-md px-3 py-2 w-36"
              />
              <button
                onClick={verify}
                disabled={loading || code.length !== 6}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white disabled:opacity-50"
              >
                Verify
              </button>
              <button
                onClick={loadSetup}
                disabled={loading}
                className="px-3 py-2 rounded-md border"
              >
                {otpauth ? "Refresh QR" : "Start Setup"}
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={disable2fa}
              disabled={loading}
              className="px-4 py-2 rounded-md border border-red-300 text-red-700"
            >
              Disable 2FA
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
