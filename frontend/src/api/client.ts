// frontend/src/api/client.ts
import axios from "axios";

export type LoginPayload = {
  email: string;
  password: string;
  code?: string;
};

type LoginResponse =
  | { token: string; user?: any }
  | { status?: string; message?: string };

const api = axios.create({
  baseURL: "/api",
});

// ---------------- token helpers ----------------
export function setToken(token?: string) {
  if (token) {
    localStorage.setItem("token", token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
    delete api.defaults.headers.common.Authorization;
  }
}

// bootstrap once from any saved token
const boot = localStorage.getItem("token");
if (boot) setToken(boot);

// ---------------- auth endpoints ----------------
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post("/login", payload);
  return data;
}

export async function logout(): Promise<void> {
  await api.post("/logout");
  setToken(undefined);
}

export async function register(payload: {
  full_name: string;
  email: string;
  mobile_number: string;
  password: string;
  password_confirmation: string;
}): Promise<any> {
  const { data } = await api.post("/register", payload);
  // some backends also return token; set if available
  if ((data as any)?.token) setToken((data as any).token);
  return data;
}

export async function me(): Promise<any> {
  const { data } = await api.get("/user");
  // backend returns { user: {...} }
  return data.user ?? data;
}

// ---------------- 2FA endpoints -----------------
export async function twoFaSetup(): Promise<{
  svg?: string;
  otpauth_url?: string;
  secret?: string;
}> {
  const { data } = await api.post("/2fa/setup");
  return data;
}

export async function twoFaVerify(code: string): Promise<{
  message?: string;
  two_factor_enabled?: boolean;
}> {
  const { data } = await api.post("/2fa/verify", { code });
  return data;
}

export async function twoFaDisable(): Promise<any> {
  const { data } = await api.post("/2fa/disable");
  return data;
}

export default api;
