"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp, API_URL } from "@/components/AppContext";
import { Mail, Lock, ShieldCheck, Loader2 } from "lucide-react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";

export default function LoginPage() {
  const { login, showToast } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Email and password are required.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        login(data.user, data.token);
      } else {
        showToast(data.error || "Login failed.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to connect to authentication server.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In Handler
  const handleGoogleLogin = async () => {
    if (!auth) {
      showToast("Google Auth is not configured.", "error");
      return;
    }
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;

      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: googleUser.displayName,
          email: googleUser.email,
          photo_url: googleUser.photoURL,
          google_uid: googleUser.uid,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        login(data.user, data.token);
        showToast("Signed in with Google successfully!", "success");
      } else {
        showToast(data.error || "Google login failed.", "error");
      }
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        showToast("Google sign-in failed. Please try again.", "error");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Quick Login Helper
  const handleQuickLogin = (role: "admin" | "creator" | "supporter") => {
    if (role === "admin") {
      setEmail("admin@novarise.com");
      setPassword("AdminPass123!");
    } else if (role === "creator") {
      setEmail("creator@novarise.com");
      setPassword("CreatorPass123!");
    } else {
      setEmail("supporter@novarise.com");
      setPassword("SupporterPass123!");
    }
    showToast(`Loaded ${role} profile credentials!`, "info");
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 relative overflow-hidden">
      
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-violet-650/10 blur-3xl z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-cyan-650/10 blur-3xl z-0"></div>

      <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#0c0f1a]/80 p-8 shadow-2xl space-y-6 relative z-10 backdrop-blur-md">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-white">Welcome Back</h2>
          <p className="text-xs text-slate-400">Log in to manage campaigns and back visionaries.</p>
        </div>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex justify-center items-center gap-3 rounded-xl border border-white/[0.10] bg-white/[0.04] hover:bg-white/[0.08] py-3 text-sm font-semibold text-white transition-all disabled:opacity-50 cursor-pointer"
        >
          {googleLoading ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
          ) : (
            <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-white/[0.06]"></div>
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">or</span>
          <div className="flex-1 border-t border-white/[0.06]"></div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-350">Email Address</label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] pl-10 pr-4 py-3 text-sm text-white focus:border-violet-500 focus:bg-white/[0.04] transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-350">Password</label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] pl-10 pr-4 py-3 text-sm text-white focus:border-violet-500 focus:bg-white/[0.04] transition-all outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 py-3 text-xs font-bold text-white shadow-lg shadow-violet-500/20 hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
            Log In Session
          </button>
        </form>

        {/* Quick Demo Logins */}
        <div className="space-y-3.5 pt-2">
          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            Quick Access Demo Profiles
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin("admin")}
              className="rounded-lg bg-cyan-950/30 border border-cyan-800/30 py-1.5 text-[9px] font-bold text-cyan-400 hover:bg-cyan-950/50 cursor-pointer"
            >
              Admin
            </button>
            <button
              onClick={() => handleQuickLogin("creator")}
              className="rounded-lg bg-violet-950/30 border border-violet-800/30 py-1.5 text-[9px] font-bold text-violet-400 hover:bg-violet-950/50 cursor-pointer"
            >
              Creator
            </button>
            <button
              onClick={() => handleQuickLogin("supporter")}
              className="rounded-lg bg-slate-900 border border-slate-700/50 py-1.5 text-[9px] font-bold text-slate-350 hover:bg-slate-800 cursor-pointer"
            >
              Supporter
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-[10px] text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-slate-350 hover:text-white transition-colors">
            Register Workspace
          </Link>
        </p>

      </div>
    </div>
  );
}
