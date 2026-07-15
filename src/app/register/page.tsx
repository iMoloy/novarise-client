"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp, API_URL } from "@/components/AppContext";
import { User, Mail, Lock, Image as ImageIcon, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const { showToast } = useApp();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"supporter" | "creator">("supporter");
  const [photoUrl, setPhotoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Validate passwords strength
  const validatePasswordStrength = (pass: string) => {
    if (pass.length < 6) return "Password must be at least 6 characters long.";
    if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase character.";
    if (!/[a-z]/.test(pass)) return "Password must contain at least one lowercase character.";
    if (!/[0-9]/.test(pass)) return "Password must contain at least one numeric character.";
    return null;
  };

  // Profile Image upload handler (handles ImgBB API or local base64 fallback)
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
      if (apiKey) {
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setPhotoUrl(data.data.url);
          showToast("Profile picture uploaded to ImgBB!", "success");
          setUploading(false);
          return;
        }
      }

      // Local base64 loader fallback
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
        showToast("Profile image loaded (Base64 file preview)!", "info");
        setUploading(false);
      };
      reader.readAsDataURL(file);

    } catch (err) {
      console.error(err);
      showToast("Error uploading profile image.", "error");
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      showToast(passwordError, "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          photo_url: photoUrl,
          password,
          role,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Registration successful! Please log in.", "success");
        router.push("/login");
      } else {
        showToast(data.error || "Failed to create account.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 relative overflow-hidden">
      
      {/* Background radial overlays */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-violet-650/10 blur-3xl z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-cyan-650/10 blur-3xl z-0"></div>

      <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#0c0f1a]/85 p-8 shadow-2xl space-y-6 relative z-10 backdrop-blur-md">
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-white">Create Workspace</h2>
          <p className="text-xs text-slate-400">Join NovaRise to fund projects or showcase goals.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-350">Display Name</label>
            <div className="relative">
              <User className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] pl-10 pr-4 py-2.5 text-xs text-white focus:border-violet-500 focus:bg-white/[0.04] transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-350">Email Address</label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] pl-10 pr-4 py-2.5 text-xs text-white focus:border-violet-500 focus:bg-white/[0.04] transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-350">Select Workspace Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("supporter")}
                className={`rounded-xl border py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  role === "supporter"
                    ? "bg-cyan-600/10 border-cyan-550 text-cyan-400"
                    : "border-white/[0.08] bg-white/[0.01] text-slate-400 hover:text-white"
                }`}
              >
                Supporter (Backer)
              </button>
              <button
                type="button"
                onClick={() => setRole("creator")}
                className={`rounded-xl border py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  role === "creator"
                    ? "bg-violet-600/10 border-violet-550 text-violet-400"
                    : "border-white/[0.08] bg-white/[0.01] text-slate-400 hover:text-white"
                }`}
              >
                Creator (Campaigner)
              </button>
            </div>
            <span className="block text-[10px] text-slate-500 font-medium">
              {role === "supporter"
                ? "Starting balance: 50 credits. Pledges campaigns."
                : "Starting balance: 20 credits. Creates projects & requests cashouts."}
            </span>
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
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] pl-10 pr-4 py-2.5 text-xs text-white focus:border-violet-500 focus:bg-white/[0.04] transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-350">Profile Picture (Optional)</label>
            <div className="flex gap-4 items-center">
              <div className="relative flex-grow">
                <ImageIcon className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  disabled={uploading}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] pl-10 pr-4 py-2 text-[10px] text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[9px] file:font-semibold file:bg-violet-950/40 file:text-violet-400 hover:file:bg-violet-950/60 transition-all outline-none cursor-pointer"
                />
              </div>
              {photoUrl && (
                <img src={photoUrl} alt="Preview" className="h-9 w-9 rounded-full object-cover border border-white/[0.1]" />
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 py-3 text-xs font-bold text-white shadow-lg shadow-violet-500/20 hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
            Register Account
          </button>
        </form>

        <p className="text-center text-[10px] text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="font-bold text-slate-350 hover:text-white transition-colors">
            Login Session
          </Link>
        </p>

      </div>
    </div>
  );
}
