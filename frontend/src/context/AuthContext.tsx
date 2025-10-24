import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/api/axios";

type User = {
  id: number;
  email: string;
  full_name: string;
  mobile_number?: string;
  is_verified?: boolean;
};

type Ctx = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (p: {
    full_name: string;
    email: string;
    mobile_number: string;
    password: string;
    password_confirmation: string;
  }) => Promise<void>;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<Ctx>({} as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("ppk_token")
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(!!token);

  useEffect(() => {
    if (token) fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function fetchMe() {
    try {
      setLoading(true);
      const { data } = await api.get("/user");
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const { data } = await api.post("/login", { email, password });
    const t = data.token as string;
    localStorage.setItem("ppk_token", t);
    setToken(t);
    await fetchMe();
  }

  async function register(payload: {
    full_name: string;
    email: string;
    mobile_number: string;
    password: string;
    password_confirmation: string;
  }) {
    const { data } = await api.post("/register", payload);
    const t = data.token as string;
    localStorage.setItem("ppk_token", t);
    setToken(t);
    await fetchMe();
  }

  async function logout() {
    try {
      await api.post("/logout");
    } catch {}
    localStorage.removeItem("ppk_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, fetchMe, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
