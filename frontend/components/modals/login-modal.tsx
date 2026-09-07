"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";

declare global {
  interface Window {
    google: any;
  }
}

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleReady, setGoogleReady] = useState(false);

  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

  // ✅ Email/password login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email.trim(), password);
      toast.success("Login successful!");
      onOpenChange(false);
      // Reload to update UI with logged-in state
      window.location.reload();
    } catch (err: any) {
      console.error("Login failed:", err);
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load Google Identity script
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local");
      return;
    }

    const existing = document.getElementById("google-oauth-script");
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.id = "google-oauth-script";
      script.onload = () => setGoogleReady(true);
      document.head.appendChild(script);
    } else {
      setGoogleReady(true);
    }
  }, [GOOGLE_CLIENT_ID]);

  // ✅ Google OAuth ID Token Flow
  const handleGoogleLogin = () => {
    if (!window.google?.accounts?.id) {
      toast.error("Google services not ready yet. Please wait.");
      return;
    }

    // Initialize and trigger the One Tap prompt
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response: any) => {
        const credential = response.credential; // This is the ID token
        if (!credential) {
          console.error("No credential received:", response);
          toast.error("Google sign-in failed.");
          return;
        }

        try {
          const res = await fetch(`${API_URL}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_token: credential }),
          });

          const contentType = res.headers.get("content-type");
          const data = contentType && contentType.includes("application/json") ? await res.json() : {};
          if (!res.ok) throw new Error(data.detail || `Login failed (${res.status})`);

          // Store tokens
          localStorage.setItem("ec_access_token", data.access_token);
          localStorage.setItem("ec_refresh_token", data.refresh_token);

          toast.success(`Welcome, ${data.user.name}`);
          console.log("✅ Logged in via Google:", data);
          onOpenChange(false);
          // Reload to update UI with logged-in state
          window.location.reload();
        } catch (err: any) {
          console.error("Google login error:", err);
          toast.error("Google login failed. Check console for details.");
        }
      },
    });

    window.google.accounts.id.prompt();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-xl relative z-[9999]">
          {/* Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-semibold text-green-600">
              Sign In to E-Connecto
            </DialogTitle>
            <p className="text-gray-500 text-sm mt-1">
              Welcome back! Sign in with your account or Google.
            </p>
          </DialogHeader>

          {/* Email / Password Form */}
          <form onSubmit={handleLogin} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gray-300 dark:border-gray-700 focus:ring-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-gray-300 dark:border-gray-700 focus:ring-green-500"
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-neutral-900 text-gray-500">
                or
              </span>
            </div>
          </div>

          {/* Google Login */}
          <div className="flex justify-center">
            <Button
              onClick={handleGoogleLogin}
              disabled={!googleReady}
              variant="outline"
              className="w-full border border-gray-300 flex items-center justify-center gap-2"
            >
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google"
                width={18}
                height={18}
              />
              Continue with Google
            </Button>
          </div>

          <p className="text-xs text-center text-gray-400 mt-4">
            By signing in, you agree to our{" "}
            <span className="text-green-600 font-medium cursor-pointer hover:underline">
              Terms
            </span>{" "}
            &{" "}
            <span className="text-green-600 font-medium cursor-pointer hover:underline">
              Privacy Policy
            </span>
            .
          </p>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
