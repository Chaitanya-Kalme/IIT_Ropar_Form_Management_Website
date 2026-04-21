"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useRef } from "react";
import { Menu, X, User, LogOut, Home, FileText, Clock, Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications"; // ✅ real hook, no local mock

const navItems = [
  { label: "Home",    path: "/dashboard", icon: Home },
  { label: "Forms",   path: "/forms",     icon: FileText },
  { label: "History", path: "/history",   icon: Clock },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
type NotifType = "approved" | "rejected" | "pending" | "review";

const typeConfig: Record<NotifType, { emoji: string; bg: string }> = {
  approved: { emoji: "✅", bg: "bg-green-100" },
  rejected: { emoji: "❌", bg: "bg-red-100" },
  pending:  { emoji: "⏳", bg: "bg-yellow-100" },
  review:   { emoji: "🔍", bg: "bg-blue-100" },
};

// ─── Notification Bell ────────────────────────────────────────────────────────
function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // ✅ using the real hook — no local mock
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Bell trigger */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        className="relative h-9 w-9 rounded-full text-white hover:bg-white/20"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] w-[18px] animate-pulse items-center justify-center rounded-full border-2 border-blue-800 bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-12 z-50 w-[360px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-bold text-gray-900">🔔 Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <ul className="max-h-[380px] divide-y divide-gray-50 overflow-y-auto">
            {/* Loading state */}
            {loading && (
              <li className="flex flex-col gap-3 px-4 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 animate-pulse">
                    <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 rounded bg-gray-200" />
                      <div className="h-2 w-full rounded bg-gray-100" />
                      <div className="h-2 w-1/3 rounded bg-gray-100" />
                    </div>
                  </div>
                ))}
              </li>
            )}

            {/* Empty state */}
            {!loading && notifications.length === 0 && (
              <li className="py-10 text-center text-sm text-gray-400">
                No notifications yet
              </li>
            )}

            {/* Notification items */}
            {!loading && notifications.map((n) => {
              const cfg = typeConfig[n.type as NotifType] ?? typeConfig.review;
              return (
                <li
                  key={n.id}
                  onClick={() => {
                    markRead(n.id);
                    if (n.formId) router.push(`/history/${n.submissionId}`);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50",
                    !n.read && "bg-blue-50 hover:bg-blue-100/60"
                  )}
                >
                  {/* Icon */}
                  <div className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base",
                    cfg.bg
                  )}>
                    {cfg.emoji}
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold leading-tight text-gray-900">
                      {n.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-gray-500">
                      {n.description}
                    </p>
                    <p className="mt-1 text-[10px] text-gray-400">
                      {new Date(n.time).toLocaleString("en-IN", {
                        day:    "numeric",
                        month:  "short",
                        hour:   "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!n.read && (
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                  )}
                </li>
              );
            })}
          </ul>

          {/* Footer */}
          <div
            className="cursor-pointer border-t px-4 py-3 text-center text-xs font-medium text-blue-600 hover:bg-gray-50"
            onClick={() => { router.push("/notifications"); setOpen(false); }}
          >
            View all notifications →
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); router.push("/login"); };

  return (
    <header className="sticky top-0 z-50 gradient-navbar" style={{ boxShadow: "var(--shadow-navbar)" }}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 p-1">
            <span className="text-white font-bold text-sm">IIT</span>
          </div>
          <span className="hidden font-heading text-lg font-bold text-white sm:block">
            Forms Portal
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  active ? "nav-link-active" : "nav-link-inactive"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* 🔔 Notification Bell */}
          <NotificationBell />

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-white/20">
                <Avatar className="h-9 w-9 border-2 border-white/30">
                  <AvatarFallback className="gradient-accent font-heading text-sm font-semibold text-white">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 border border-white/30 bg-white/90 backdrop-blur-sm">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer text-blue-600">
                <User className="mr-2 h-4 w-4" /> My Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="gradient-navbar border-t border-white/10 px-4 pb-4 pt-2 md:hidden">
          {navItems.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  active ? "nav-link-active" : "nav-link-inactive"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}