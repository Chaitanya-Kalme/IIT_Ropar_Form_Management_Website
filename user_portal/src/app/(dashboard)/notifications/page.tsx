// app/notifications/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { Bell, CheckCheck, ArrowLeft, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

type NotifType = "approved" | "rejected" | "pending" | "review";

const typeConfig: Record<NotifType, { emoji: string; bg: string; label: string; pill: string }> = {
  approved: { emoji: "✅", bg: "bg-green-50",  label: "Approved", pill: "bg-green-100 text-green-700" },
  rejected: { emoji: "❌", bg: "bg-red-50",    label: "Rejected", pill: "bg-red-100 text-red-700"     },
  pending:  { emoji: "⏳", bg: "bg-yellow-50", label: "Pending",  pill: "bg-yellow-100 text-yellow-700"},
  review:   { emoji: "🔍", bg: "bg-blue-50",   label: "Review",   pill: "bg-blue-100 text-blue-700"   },
};

const FILTERS = ["All", "Unread", "Approved", "Rejected", "Pending", "Review"] as const;
type Filter = (typeof FILTERS)[number];

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  const filtered = notifications.filter((n) => {
    if (activeFilter === "All")    return true;
    if (activeFilter === "Unread") return !n.read;
    return n.type === activeFilter.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Page header ─────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="h-8 w-8 text-gray-500 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllRead}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs gap-1.5"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </Button>
            )}
          </div>

          {/* ── Filter chips ─────────────────────────────────── */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1 text-xs font-medium transition-all border",
                  activeFilter === f
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                )}
              >
                {f}
                {f === "Unread" && unreadCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-red-500 text-white text-[9px] px-1.5 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── List ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 space-y-2">
        {/* Skeleton */}
        {loading && (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-start gap-4 bg-white rounded-2xl p-4 border border-gray-100">
              <div className="h-11 w-11 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-2/3 rounded bg-gray-200" />
                <div className="h-3 w-full rounded bg-gray-100" />
                <div className="h-2.5 w-1/4 rounded bg-gray-100" />
              </div>
            </div>
          ))
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">🔕</div>
            <p className="text-gray-500 font-medium">No notifications here</p>
            <p className="text-gray-400 text-sm mt-1">
              {activeFilter !== "All" ? "Try a different filter" : "You're all caught up!"}
            </p>
          </div>
        )}

        {/* Items */}
        {!loading && filtered.map((n) => {
          const cfg = typeConfig[n.type as NotifType] ?? typeConfig.review;
          return (
            <div
              key={n.id}
              onClick={() => {
                markRead(n.id);
                if (n.submissionId) router.push(`/history/${n.submissionId}`);
              }}
              className={cn(
                "group flex items-start gap-4 rounded-2xl border p-4 cursor-pointer transition-all duration-200",
                "hover:shadow-md hover:-translate-y-0.5",
                n.read
                  ? "bg-white border-gray-100"
                  : "bg-blue-50/60 border-blue-100"
              )}
            >
              {/* Icon */}
              <div className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl",
                cfg.bg
              )}>
                {cfg.emoji}
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn(
                    "text-sm leading-tight",
                    n.read ? "font-medium text-gray-800" : "font-semibold text-gray-900"
                  )}>
                    {n.title}
                  </p>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", cfg.pill)}>
                    {cfg.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {n.description}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-[10px] text-gray-400">
                    {new Date(n.time).toLocaleString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                  {n.formTitle && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="text-[10px] text-blue-500 font-medium truncate max-w-[160px]">
                        {n.formTitle}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Unread dot */}
              {!n.read && (
                <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}