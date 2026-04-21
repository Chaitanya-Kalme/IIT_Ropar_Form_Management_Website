// components/verifier/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Bell, Sun, Moon, ChevronRight, User, LogOut, CheckCheck } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useApp } from '@/lib/app-context';
import { useVerifierNotifications } from '@/hooks/useVerifierNotifications';

const breadcrumbMap: Record<string, string> = {
  '/dashboard':        'Dashboard',
  '/assigned-forms':   'All Assigned Forms',
  '/pending-approvals':'Pending Approvals',
  '/all-submissions':  'All Submissions',
  '/activity':         'Activity',
  '/profile':          'Profile',
  '/form-details':     'Form Details',
};

function getBreadcrumbs(path: string) {
  const parts = path.split('/').filter(Boolean);
  const crumbs: { label: string; href: string }[] = [{ label: 'Dashboard', href: '/dashboard' }];
  let current = '';
  for (const part of parts) {
    current += '/' + part;
    const label = breadcrumbMap[current] || part.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    if (current !== '/dashboard') crumbs.push({ label, href: current });
  }
  return crumbs;
}

type VerifierNotifType = "new_submission" | "resubmission" | "deadline" | "info";

const notifTypeConfig: Record<VerifierNotifType, { dot: string; bg: string; emoji: string }> = {
  new_submission: { dot: '#3B82F6', bg: '#EFF6FF', emoji: '📋' },
  resubmission:   { dot: '#22C55E', bg: '#F0FDF4', emoji: '🔄' },
  deadline:       { dot: '#F59E0B', bg: '#FFFBEB', emoji: '⏰' },
  info:           { dot: '#8B5CF6', bg: '#F5F3FF', emoji: 'ℹ️' },
};

export default function Navbar() {
  const { theme, toggle }   = useTheme();
  const { currentUser, logout } = useApp();
  const pathname            = usePathname();
  const router              = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotif,    setShowNotif]    = useState(false);

  const {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
  } = useVerifierNotifications();

  const crumbs    = getBreadcrumbs(pathname);
  const pageTitle = crumbs[crumbs.length - 1]?.label || 'Dashboard';

  const displayName     = currentUser?.name     ?? 'Verifier';
  const displayEmail    = currentUser?.email    ?? '';
  const displayRole     = currentUser?.role     ?? '';
  const displayInitials = currentUser?.initials
    ?? displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-4 px-6 border-b"
      style={{ background: 'var(--card)', borderColor: 'var(--border)', height: 64 }}
    >
      {/* ── Breadcrumbs ────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {crumbs.map((c, i) => (
          <span key={c.href} className="flex items-center gap-1.5">
            {i > 0 && (
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
            )}
            <Link
              href={c.href}
              className="text-sm font-medium transition-colors hover:underline truncate"
              style={{ color: i === crumbs.length - 1 ? 'var(--text)' : 'var(--text-muted)' }}
            >
              {c.label}
            </Link>
          </span>
        ))}
      </div>

      {/* ── Page title (center) ─────────────────────────────────── */}
      <h1
        className="hidden md:block text-base font-bold absolute left-1/2 -translate-x-1/2"
        style={{ color: 'var(--text)' }}
      >
        {pageTitle}
      </h1>

      {/* ── Right controls ──────────────────────────────────────── */}
      <div className="flex items-center gap-2">

        {/* ── Notification Bell ───────────────────────────────── */}
        <div className="relative">
          <button
            className="icon-btn relative"
            onClick={() => { setShowNotif(!showNotif); setShowUserMenu(false); }}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div
              className="absolute right-0 top-12 w-[340px] rounded-2xl shadow-card-hover z-50 overflow-hidden animate-scale-in"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              {/* Header */}
              <div
                className="px-4 py-3 border-b flex items-center justify-between"
                style={{ borderColor: 'var(--border)' }}
              >
                <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                  🔔 Notifications
                </span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: '#EFF6FF', color: '#1D4ED8' }}
                      >
                        {unreadCount} New
                      </span>
                      <button
                        onClick={markAllRead}
                        className="flex items-center gap-1 text-xs font-medium"
                        style={{ color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer' }}
                        title="Mark all as read"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* List */}
              <div className="max-h-[360px] overflow-y-auto divide-y" style={{ borderColor: 'var(--border)' }}>
                {/* Skeleton */}
                {loading && Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="px-4 py-3 flex gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 rounded bg-gray-200" />
                      <div className="h-2 w-full rounded bg-gray-100" />
                    </div>
                  </div>
                ))}

                {/* Empty */}
                {!loading && notifications.length === 0 && (
                  <div className="py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    🎉 You're all caught up!
                  </div>
                )}

                {/* Items — show latest 5 in dropdown */}
                {!loading && notifications.slice(0, 5).map((n) => {
                  const cfg = notifTypeConfig[n.type as VerifierNotifType] ?? notifTypeConfig.info;
                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        markRead(n.id);
                        if (n.submissionId) router.push(`/pending-approvals/${n.submissionId}`);
                        setShowNotif(false);
                      }}
                      className="px-4 py-3 flex gap-3 items-start cursor-pointer transition-colors"
                      style={{
                        background: n.read ? 'transparent' : cfg.bg,
                        borderColor: 'var(--border)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      {/* Icon circle */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                        style={{ background: cfg.bg }}
                      >
                        {cfg.emoji}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                          {n.title}
                        </p>
                        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                          {n.description}
                        </p>
                        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                          {new Date(n.time).toLocaleString('en-IN', {
                            day: 'numeric', month: 'short',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {!n.read && (
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                          style={{ background: cfg.dot }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 text-center border-t" style={{ borderColor: 'var(--border)' }}>
                <button
                  className="text-sm font-medium"
                  style={{ color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => { router.push('/notifications'); setShowNotif(false); }}
                >
                  View all notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button onClick={toggle} className="icon-btn" title="Toggle theme">
          {theme === 'dark'
            ? <Sun className="w-4 h-4 text-yellow-400" />
            : <Moon className="w-4 h-4" />}
        </button>

        {/* User menu */}
        <div className="relative ml-1">
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotif(false); }}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
            style={{ background: showUserMenu ? 'var(--bg)' : 'transparent', border: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
            onMouseLeave={e => { if (!showUserMenu) e.currentTarget.style.background = 'transparent'; }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)' }}
            >
              {displayInitials}
            </div>
          </button>

          {showUserMenu && (
            <div
              className="absolute right-0 top-12 w-56 rounded-xl shadow-card-hover z-50 overflow-hidden animate-scale-in"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{displayName}</p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{displayEmail}</p>
                <span
                  className="inline-block mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: '#EFF6FF', color: '#1D4ED8' }}
                >
                  {displayRole}
                </span>
              </div>
              <Link
                href="/profile"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors hover:bg-blue-50/10"
                style={{ color: 'var(--text)', textDecoration: 'none' }}
              >
                <User className="w-4 h-4" /> Profile
              </Link>
              <button
                onClick={() => { setShowUserMenu(false); logout(); }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors hover:bg-red-50/10 text-red-400"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click-outside backdrop */}
      {(showUserMenu || showNotif) && (
        <div className="fixed inset-0 z-20" onClick={() => { setShowUserMenu(false); setShowNotif(false); }} />
      )}
    </header>
  );
}