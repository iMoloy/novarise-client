"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: "admin" | "creator" | "supporter";
  photo_url?: string;
  credits: number;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

export interface NotificationItem {
  id: string;
  message: string;
  toEmail: string;
  actionRoute: string;
  time: string;
  read: boolean;
}

interface AppContextType {
  user: UserSession | null;
  loadingUser: boolean;
  toasts: Toast[];
  notifications: NotificationItem[];
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  showToast: (message: string, type?: Toast["type"]) => void;
  removeToast: (id: string) => void;
  login: (user: UserSession, token: string) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  getAuthHeaders: () => { "Content-Type": string; "Authorization"?: string };
}

const AppContext = createContext<AppContextType | null>(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();

  // Close notifications popup clicking anywhere
  useEffect(() => {
    const handleGlobalClick = () => {
      setShowNotifications(false);
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((current) => [...current, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  // Auth Headers Helper with Bearer Token from localStorage
  const getAuthHeaders = useCallback(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access-token") : null;
    const headers: any = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  }, [user, getAuthHeaders]);

  const markAllNotificationsRead = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setNotifications((current) =>
          current.map((n) => ({ ...n, read: true }))
        );
      }
    } catch (err) {
      console.error("Failed to mark notifications read", err);
    }
  }, [user, getAuthHeaders]);

  const refreshUser = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access-token") : null;
    if (!token) {
      setUser(null);
      setLoadingUser(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
          localStorage.removeItem("access-token");
        }
      } else {
        setUser(null);
        localStorage.removeItem("access-token");
      }
    } catch {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  const login = useCallback((sessionUser: UserSession, token: string) => {
    localStorage.setItem("access-token", token);
    setUser(sessionUser);
    showToast(`Welcome back, ${sessionUser.name}!`, "success");
    router.push("/dashboard");
  }, [router, showToast]);

  const logout = useCallback(async () => {
    localStorage.removeItem("access-token");
    setUser(null);
    setNotifications([]);
    showToast("Logged out successfully.", "success");
    router.push("/");
  }, [router, showToast]);

  return (
    <AppContext.Provider
      value={{
        user,
        loadingUser,
        toasts,
        notifications,
        showNotifications,
        setShowNotifications,
        showToast,
        removeToast,
        login,
        logout,
        refreshUser,
        fetchNotifications,
        markAllNotificationsRead,
        getAuthHeaders,
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="toast toast-end toast-bottom z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`alert ${
              t.type === "success"
                ? "alert-success bg-emerald-950 text-emerald-200 border-emerald-500"
                : t.type === "error"
                ? "alert-error bg-rose-950 text-rose-200 border-rose-500"
                : t.type === "warning"
                ? "alert-warning bg-amber-950 text-amber-200 border-amber-500"
                : "alert-info bg-slate-900 text-sky-200 border-sky-500"
            } border shadow-lg max-w-sm`}
          >
            <span>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="btn btn-ghost btn-xs text-current"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider.");
  }
  return context;
}
export { API_URL };
