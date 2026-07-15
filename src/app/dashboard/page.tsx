"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppContext";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import CreatorDashboard from "@/components/dashboard/CreatorDashboard";
import SupporterDashboard from "@/components/dashboard/SupporterDashboard";

export default function DashboardRouterPage() {
  const { user, loadingUser } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!loadingUser && !user) {
      router.push("/login");
    }
  }, [user, loadingUser, router]);

  if (loadingUser) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center gap-4">
        <span className="loading loading-spinner loading-lg text-violet-500"></span>
        <p className="text-xs text-slate-400 font-semibold animate-pulse">
          Validating secure workspace sessions...
        </p>
      </div>
    );
  }

  if (!user) return null;

  if (user.role === "admin") {
    return <AdminDashboard />;
  }

  if (user.role === "creator") {
    return <CreatorDashboard />;
  }

  return <SupporterDashboard />;
}
