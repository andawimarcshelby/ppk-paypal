// frontend/src/pages/security/TwoFactorSetup.tsx
import { useEffect, useState } from "react";
import { me, twoFaSetup, twoFaVerify, twoFaDisable } from "../../api/client";
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
  const [svg, setSvg] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function refresh() {
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      const u = await me();
      setUser(u);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load user.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleSetup() {
    setErr(null);
    setMsg(null);
    setLoading(true);
    setCode("");
    try {
      const data = await twoFaSetup();
      setSecret(data.secret || "");
      setOtpauth(data.otpauth_url || "");
      setSvg(data.svg || "");
      setMsg("Scan the QR with Google Authenticator, then enter the 6-digit code.");
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Failed to start 2FA setup.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      const data = await twoFaVerify(code);
      setMsg(data?.message || "2FA verified.");
      await refresh();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable() {
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      await twoFaDisable();
      setSecret("");
      setOtpauth("");
      setSvg("");
      setCode("");
      await refresh();
      setMsg("Two-factor authentication disabled.");
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Failed to disable 2FA.");
    } finally {
      setLoading(false);
    }
  }

  const enabled = !!user?.two_factor_enabled;

  return (
    <div className="min-h-screen flex items-start justify-center py-10">
      <div className="w-[520px] rounded-md border p-6 bg-white">
        <h1 className="text-lg font-semibold mb-4">Two-Factor Authentication (2FA)</h1>

        {err && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 text-red-700 px-3 py-2 text-sm">
            {err}
          </div>
        )}
        {msg && !err && (
          <div className="mb-4 rounded border border-emerald-300 bg-emerald-50 text-emerald-800 px-3 py-2 text-sm">
            {msg}
          </div>
        )}

        <div className="mb-4 text-sm">
          <div>
            <span className="font-medium">Status:</span>{" "}
            {enabled ? (
              <span className="text-emerald-700">Enabled</span>
            ) : (
              <span className="text-gray-600">Disabled</span>
            )}
          </div>
        </div>

        {!enabled && (
          <div className="space-y-4">
            {!otpauth && !svg ? (
              <button
                onClick={handleSetup}
                disabled={loading}
                className="rounded bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm disabled:opacity-60"
              >
                {loading ? "Starting…" : "Start 2FA Setup"}
              </button>
            ) : (
              <>
                <p className="text-sm text-gray-700">
                  Scan this QR in Google Authenticator (or compatible), then enter the
                  6-digit code to verify.
                </p>

                {/* Prefer backend-provided SVG if present (exact image), else render QR locally */}
                {svg ? (
                  <div
                    className="border inline-block p-3 rounded"
                    dangerouslySetInnerHTML={{ __html: svg }}
                  />
                ) : otpauth ? (
                  <div className="border inline-block p-3 rounded">
                    <QRCodeSVG value={otpauth} size={180} />
                  </div>
                ) : null}

                {secret && (
                  <div className="text-xs text-gray-500 mt-2">
                    <span className="font-medium">Secret:</span> {secret}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    className="border rounded px-3 py-2 text-sm tracking-widest"
                    inputMode="numeric"
                    pattern="\d{6}"
                    placeholder="123456"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  />
                  <button
                    onClick={handleVerify}
                    disabled={loading || code.length !== 6}
                    className="rounded bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm disabled:opacity-60"
                  >
                    Verify
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {enabled && (
          <div>
            <button
              onClick={handleDisable}
              disabled={loading}
              className="rounded bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-sm disabled:opacity-60"
            >
              {loading ? "Disabling…" : "Disable 2FA"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
