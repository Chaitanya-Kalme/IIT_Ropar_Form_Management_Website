// app/notifications/page.tsx  (verifier portal)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCheck } from 'lucide-react';
import { useVerifierNotifications, VerifierNotifType } from '@/hooks/useVerifierNotifications';

const typeConfig: Record<VerifierNotifType, { emoji: string; dot: string; bg: string; label: string; pill: string }> = {
  new_submission: { emoji: '📋', dot: '#3B82F6', bg: '#EFF6FF', label: 'New',         pill: 'bg-blue-100   text-blue-700'   },
  resubmission:   { emoji: '🔄', dot: '#22C55E', bg: '#F0FDF4', label: 'Resubmitted', pill: 'bg-green-100  text-green-700'  },
  deadline:       { emoji: '⏰', dot: '#F59E0B', bg: '#FFFBEB', label: 'Deadline',     pill: 'bg-yellow-100 text-yellow-700' },
  info:           { emoji: 'ℹ️', dot: '#8B5CF6', bg: '#F5F3FF', label: 'Info',         pill: 'bg-purple-100 text-purple-700' },
};

const FILTERS = ['All', 'Unread', 'New', 'Resubmitted', 'Deadline'] as const;
type Filter = (typeof FILTERS)[number];

export default function VerifierNotificationsPage() {
  const router = useRouter();
  const { notifications, unreadCount, loading, markRead, markAllRead } = useVerifierNotifications();
  const [activeFilter, setActiveFilter] = useState<Filter>('All');

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'All')         return true;
    if (activeFilter === 'Unread')      return !n.read;
    if (activeFilter === 'New')         return n.type === 'new_submission';
    if (activeFilter === 'Resubmitted') return n.type === 'resubmission';
    if (activeFilter === 'Deadline')    return n.type === 'deadline';
    return true;
  });

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* ── Sticky header ─────────────────────────────────────── */}
      <div
        className="sticky top-16 z-20 border-b"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="icon-btn"
                title="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
                  🔔 Notifications
                </h1>
                {unreadCount > 0 && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {unreadCount} unread
                  </p>
                )}
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: '#3B82F6', background: '#EFF6FF', border: 'none', cursor: 'pointer' }}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className="shrink-0 rounded-full px-3.5 py-1 text-xs font-medium transition-all border"
                style={{
                  background:   activeFilter === f ? '#2563EB' : 'var(--card)',
                  color:        activeFilter === f ? '#fff'     : 'var(--text-muted)',
                  borderColor:  activeFilter === f ? '#2563EB'  : 'var(--border)',
                  cursor: 'pointer',
                }}
              >
                {f}
                {f === 'Unread' && unreadCount > 0 && (
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
        {loading && Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse flex items-start gap-4 rounded-2xl border p-4"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="h-11 w-11 rounded-full bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-2/3 rounded bg-gray-200" />
              <div className="h-3 w-full rounded bg-gray-100" />
              <div className="h-2.5 w-1/4 rounded bg-gray-100" />
            </div>
          </div>
        ))}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <p className="font-medium" style={{ color: 'var(--text)' }}>No notifications here</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {activeFilter !== 'All' ? 'Try a different filter' : "You're all caught up!"}
            </p>
          </div>
        )}

        {/* Notification cards */}
        {!loading && filtered.map((n) => {
          const cfg = typeConfig[n.type as VerifierNotifType] ?? typeConfig.info;
          return (
            <div
              key={n.id}
              onClick={() => {
                markRead(n.id);
                if (n.submissionId) router.push(`/pending-approvals/${n.submissionId}`);
              }}
              className="group flex items-start gap-4 rounded-2xl border p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              style={{
                background:  n.read ? 'var(--card)' : cfg.bg,
                borderColor: n.read ? 'var(--border)' : cfg.dot + '44',
              }}
            >
              {/* Icon */}
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl"
                style={{ background: cfg.bg }}
              >
                {cfg.emoji}
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p
                    // className={cn("text-sm leading-tight", n.read ? "font-medium" : "font-semibold")}
                    style={{ color: 'var(--text)' }}
                  >
                    {n.title}
                  </p>
                  <span
                    // className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", cfg.pill)}
                  >
                    {cfg.label}
                  </span>
                </div>
                <p className="mt-1 text-xs line-clamp-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {n.description}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {new Date(n.time).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                  {n.formTitle && (
                    <>
                      <span style={{ color: 'var(--border)' }}>·</span>
                      <span className="text-[10px] font-medium truncate max-w-[160px]" style={{ color: '#3B82F6' }}>
                        {n.formTitle}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Unread dot */}
              {!n.read && (
                <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: cfg.dot }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}