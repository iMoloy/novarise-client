"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/components/AppContext";
import { LogOut, LayoutDashboard, Compass, Bell, Wallet, User as UserIcon, Menu, X, ArrowUpRight } from "lucide-react";

export default function Navbar() {
  const { user, logout, notifications, showNotifications, setShowNotifications, markAllNotificationsRead } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleToggleNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      markAllNotificationsRead();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#070913]/70 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-0.5 shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-all">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#070913]">
                  <Image src="/icon.svg" alt="Logo" width={20} height={20} className="w-5 h-5" />
                </div>
              </div>
              <span className="text-lg font-black tracking-wider text-white bg-clip-text">
                NOVA<span className="text-cyan-400 font-extrabold">RISE</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/explore"
                className="text-xs font-bold text-slate-300 hover:text-white transition-colors flex items-center gap-1"
              >
                <Compass className="h-4 w-4" />
                Explore Campaigns
              </Link>
            </nav>
          </div>

          {/* Desktop Right Panel Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {/* Available Balance Counter */}
                <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1.5 text-xs">
                  <Wallet className="h-4 w-4 text-cyan-400" />
                  <span className="font-semibold text-slate-350">
                    <strong className="text-white font-bold">{user.credits}</strong> Credits
                  </span>
                </div>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={handleToggleNotifications}
                    className="relative flex h-9.5 w-9.5 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all cursor-pointer"
                  >
                    <Bell className="h-4.5 w-4.5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[9px] font-black text-black ring-2 ring-[#070913] animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown Panel */}
                  {showNotifications && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 mt-2.5 w-80 rounded-2xl border border-white/[0.08] bg-[#0c0f1a] p-4 shadow-2xl space-y-3.5 z-55 max-h-96 overflow-y-auto"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                        <span className="text-xs font-bold text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/40 px-2 py-0.5 rounded-full">
                            {unreadCount} New
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {notifications.length === 0 ? (
                          <p className="text-[11px] text-slate-500 text-center py-4">No notifications yet.</p>
                        ) : (
                          notifications.map((n) => (
                            <Link
                              href={n.actionRoute}
                              key={n.id}
                              onClick={() => setShowNotifications(false)}
                              className={`block p-2.5 rounded-xl border text-[11px] transition-all ${
                                n.read
                                  ? "border-transparent bg-transparent text-slate-400 hover:bg-white/[0.02]"
                                  : "border-cyan-500/10 bg-cyan-600/5 text-slate-200 hover:bg-cyan-600/10"
                              }`}
                            >
                              <p className="leading-relaxed">{n.message}</p>
                              <span className="block text-[9px] text-slate-500 mt-1">
                                {new Date(n.time).toLocaleTimeString()}
                              </span>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Dashboard Shortcut Button */}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 rounded-xl bg-violet-600/10 border border-violet-500/30 px-4 py-2 text-xs font-bold text-violet-400 hover:bg-violet-600/20 transition-all"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="flex items-center justify-center h-9.5 w-9.5 rounded-full border border-rose-900/40 bg-rose-950/20 text-rose-450 hover:bg-rose-950/30 transition-all cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-bold text-slate-350 hover:text-white px-3 py-2 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1 rounded-xl bg-white text-black hover:bg-slate-100 px-4 py-2 text-xs font-bold transition-all"
                >
                  Register
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-3">
            {user && (
              <div className="relative">
                <button
                  onClick={handleToggleNotifications}
                  className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] text-slate-300 cursor-pointer"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-3 w-3 items-center justify-center rounded-full bg-cyan-500 text-[8px] font-black text-black">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-slate-300 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.06] bg-[#070913] px-4 py-4 space-y-4">
          <nav className="flex flex-col gap-2">
            <Link
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-bold text-slate-300 hover:text-white py-2 flex items-center gap-2"
            >
              <Compass className="h-4 w-4" />
              Explore Campaigns
            </Link>
            {user && (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-slate-300 hover:text-white py-2 flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            )}
          </nav>
          
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
            {user ? (
              <>
                <span className="text-xs font-semibold text-slate-400">
                  Balance: <strong className="text-cyan-400 font-bold">{user.credits}</strong> Cr
                </span>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="btn btn-xs bg-rose-950 border-rose-800 text-rose-350 cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-4 w-full">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-bold text-slate-300 border border-white/[0.08] rounded-xl hover:text-white"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-bold bg-white text-black rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
