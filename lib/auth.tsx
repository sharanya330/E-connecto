"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "/api";

type User = any;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ✅ Load /me on mount
  useEffect(() => {
    fetch(`${API_URL}/auth/me`)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // ✅ Email/password login
  async function login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const contentType = res.headers.get("content-type");
    const data = contentType && contentType.includes("application/json") ? await res.json() : {};
    if (!res.ok) throw new Error(data.detail || `Login failed (${res.status})`);

    setUser(data.user);
    router.push("/dashboard");
  }

  // ✅ Register
  async function register(name: string, email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const contentType = res.headers.get("content-type");
    const data = contentType && contentType.includes("application/json") ? await res.json() : {};
    if (!res.ok) throw new Error(data.detail || `Registration failed (${res.status})`);

    setUser(data.user);
    router.push("/dashboard");
  }

  // ✅ Google OAuth
  async function googleLogin(code: string) {
    // Implementation pending Google Auth API route
    console.log("Google login not yet implemented in backend migration");
  }

  // ✅ Logout
  async function logout() {
    await fetch(`${API_URL}/auth/logout`, { method: "POST" });
    setUser(null);
    router.push("/");
  }

  // ✅ Refresh (No-op for cookie auth as it's handled by browser)
  async function refresh() {
    // Optional: re-fetch /me
    const res = await fetch(`${API_URL}/auth/me`);
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
