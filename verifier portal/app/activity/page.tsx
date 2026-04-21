'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import {
  CheckCircle, XCircle, FileText, CornerDownLeft,
  Clock, RefreshCw, Activity, Loader2, AlertTriangle,
  Search, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ActivityType = 'approved' | 'rejected' | 'submitted' | 'sent-back' | 'other';

interface ActivityItem {
  id: string;
  type: ActivityType;
  icon: string;
  message: string;
  action: string;
  actor: {
    id: string | null;
    name: string;
    role: string | null;
  };
  formId: number | null;
  formTitle: string | null;
  submissionId: string | null;
  time: string;
}

interface Stats {
  totalActions: number;
  approvals: number;
  rejections: number;
  sentBacks: number;
}

// ─── Icon / label maps ────────────────────────────────────────────────────────

const iconMap: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
  check: { icon: CheckCircle, bg: '#F0FDF4', color: '#22C55E' },
  x: { icon: XCircle, bg: '#FFF5F5', color: '#EF4444' },
  file: { icon: FileText, bg: '#EFF6FF', color: '#3B82F6' },
  refresh: { icon: CornerDownLeft, bg: '#FFFBEB', color: '#F59E0B' },
  clock: { icon: Clock, bg: 'var(--bg)', color: '#94A3B8' },
};

const typeLabels: Record<string, { label: string; cls: string; color: string }> = {
  approved: { label: 'Approved', cls: 'badge-accepted', color: '#22C55E' },
  rejected: { label: 'Rejected', cls: 'badge-rejected', color: '#EF4444' },
  submitted: { label: 'Submitted', cls: 'badge', color: '#3B82F6' },
  'sent-back': { label: 'Sent Back', cls: 'badge-pending', color: '#F59E0B' },
  other: { label: 'Action', cls: 'badge', color: '#94A3B8' },
};

const ALL_TYPES = ['all', 'approved', 'rejected', 'submitted', 'sent-back', 'other'] as const;

const PAGE_SIZE_OPTIONS = [10, 20, 50];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso: string): { relative: string; absolute: string } {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  let relative: string;
  if (diffMins < 1) relative = 'Just now';
  else if (diffMins < 60) relative = `${diffMins}m ago`;
  else if (diffMins < 1440) relative = `${Math.floor(diffMins / 60)}h ago`;
  else relative = `${Math.floor(diffMins / 1440)}d ago`;

  const absolute = date.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  }) + ' · ' + date.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  return { relative, absolute };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ActivityPage() {
  const router = useRouter();

  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Filters — draft (typing) vs committed (applied)
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [startDraft, setStartDraft] = useState('');
  const [endDraft, setEndDraft] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchActivity = useCallback(async (cursor?: string) => {
    try {
      cursor ? setLoadingMore(true) : setLoading(true);
      setError(null);

      const params = new URLSearchParams({ limit: '200' });
      if (cursor) params.set('cursor', cursor);

      const res = await fetch(`/api/verifier/activity?${params.toString()}`);
      if (res.status === 401) { router.push('/login'); return; }
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Failed to load activity');
      }

      const json = await res.json();
      setActivity(prev => cursor ? [...prev, ...json.activity] : json.activity);
      setStats(json.stats);
      setNextCursor(json.nextCursor);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [router]);

  useEffect(() => { fetchActivity(); }, [fetchActivity]);

  // ── Commit helpers (Enter / blur) ─────────────────────────────────────────
  const commitSearch = () => { setSearch(searchDraft); setPage(1); };
  const commitDates = () => { setStartDate(startDraft); setEndDate(endDraft); setPage(1); };

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitSearch();
  };
  const handleDateKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitDates();
  };

  const clearFilters = () => {
    setSearchDraft(''); setSearch('');
    setStartDraft(''); setStartDate('');
    setEndDraft(''); setEndDate('');
    setTypeFilter('all');
    setPage(1);
  };

  const hasFilters = search || typeFilter !== 'all' || startDate || endDate;

  // ── Client-side filter + paginate ─────────────────────────────────────────
  const filtered = useMemo(() => {
    return activity.filter(item => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;

      if (search) {
        const q = search.toLowerCase();
        const hit =
          item.message.toLowerCase().includes(q) ||
          item.actor.name.toLowerCase().includes(q) ||
          (item.formTitle ?? '').toLowerCase().includes(q);
        if (!hit) return false;
      }

      if (startDate) {
        const itemDate = new Date(item.time);
        const from = new Date(startDate);
        from.setHours(0, 0, 0, 0);
        if (itemDate < from) return false;
      }

      if (endDate) {
        const itemDate = new Date(item.time);
        const to = new Date(endDate);
        to.setHours(23, 59, 59, 999);
        if (itemDate > to) return false;
      }

      return true;
    });
  }, [activity, typeFilter, search, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedActivity = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, filtered.length);

  // Page number window
  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const delta = 2;
    const left = Math.max(2, safePage - delta);
    const right = Math.min(totalPages - 1, safePage + delta);
    const nums: (number | '...')[] = [1];
    if (left > 2) nums.push('...');
    for (let i = left; i <= right; i++) nums.push(i);
    if (right < totalPages - 1) nums.push('...');
    nums.push(totalPages);
    return nums;
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--text-muted)' }} />
          <span className="ml-2 text-sm" style={{ color: 'var(--text-muted)' }}>Loading activity...</span>
        </div>
      </DashboardLayout>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <AlertTriangle className="w-8 h-8 text-red-400" />
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{error}</p>
          <button onClick={() => fetchActivity()} className="btn-outline text-sm">Retry</button>
        </div>
      </DashboardLayout>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Activity Log</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Recent verification activity across all your assigned forms
        </p>
      </div>

      {/* Stats strip */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Actions', val: stats.totalActions, color: '#3B82F6', bg: '#EFF6FF' },
            { label: 'Approvals', val: stats.approvals, color: '#22C55E', bg: '#F0FDF4' },
            { label: 'Rejections', val: stats.rejections, color: '#EF4444', bg: '#FFF5F5' },
            { label: 'Sent Back', val: stats.sentBacks, color: '#F59E0B', bg: '#FFFBEB' },
          ].map(({ label, val, color, bg }) => (
            <div key={label} className="content-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Activity className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color }}>{val}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="content-card mb-5">
        <div className="p-4 flex flex-wrap gap-3 items-end">

          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: 'var(--text-muted)' }} />
            <input
              value={searchDraft}
              onChange={e => setSearchDraft(e.target.value)}
              onKeyDown={handleSearchKey}
              onBlur={commitSearch}
              placeholder="Search by message, actor or form… (press Enter)"
              className="form-input pl-9"
            />
          </div>

          {/* Type filter */}
          <div className="relative min-w-36">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: 'var(--text-muted)' }} />
            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
              className="form-input pl-9 appearance-none cursor-pointer"
            >
              <option value="all">All Types</option>
              {ALL_TYPES.filter(t => t !== 'all').map(t => (
                <option key={t} value={t}>{typeLabels[t]?.label ?? t}</option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDraft}
              onChange={e => setStartDraft(e.target.value)}
              onKeyDown={handleDateKey}
              onBlur={commitDates}
              className="form-input"
              title="From date (press Enter to apply)"
            />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>to</span>
            <input
              type="date"
              value={endDraft}
              onChange={e => setEndDraft(e.target.value)}
              onKeyDown={handleDateKey}
              onBlur={commitDates}
              className="form-input"
              title="To date (press Enter to apply)"
            />
          </div>

          {/* Clear */}
          {(hasFilters || searchDraft) && (
            <button onClick={clearFilters} className="btn-outline flex items-center gap-1.5">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Timeline / List */}
      <div className="content-card p-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <h3 className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <RefreshCw style={{ width: 18, height: 18, color: '#3B82F6' }} />
            Activity
            {filtered.length !== activity.length && (
              <span className="text-xs font-normal px-2 py-0.5 rounded-full"
                style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                {filtered.length} of {activity.length}
              </span>
            )}
          </h3>
          {filtered.length > 0 && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Showing <strong style={{ color: 'var(--text)' }}>{rangeStart}–{rangeEnd}</strong> of{' '}
              <strong style={{ color: 'var(--text)' }}>{filtered.length}</strong> results
            </p>
          )}
        </div>

        {pagedActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Activity className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              {hasFilters ? 'No activity matches your filters' : 'No activity yet'}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {hasFilters ? 'Try adjusting your search or date range' : 'Actions you take on submissions will appear here'}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="btn-outline text-xs mt-1">Clear filters</button>
            )}
          </div>
        ) : (
          <div className="space-y-0">
            {pagedActivity.map((item, i) => {
              const { icon: Icon, bg, color } = iconMap[item.icon] ?? iconMap.clock;
              const typeInfo = typeLabels[item.type] ?? typeLabels.other;
              const isLast = i === pagedActivity.length - 1;
              const { relative, absolute } = formatDateTime(item.time);

              return (
                <div key={item.id} className="flex gap-4">
                  {/* Icon + connector line */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                      style={{ background: bg, border: `1.5px solid ${color}30` }}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    {!isLast && (
                      <div className="w-0.5 flex-1 my-1"
                        style={{ background: 'var(--border)', minHeight: 24 }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-5'}`}>
                    <div
                      className="rounded-xl p-4 transition-all"
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = color + '60'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <p className="text-sm font-medium flex-1" style={{ color: 'var(--text)' }}>
                          {item.message}
                        </p>
                        <span className={`badge ${typeInfo.cls} flex-shrink-0`} style={{ fontSize: 11 }}>
                          {typeInfo.label}
                        </span>
                      </div>

                      {/* Meta row */}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {/* Date + time — relative with full tooltip */}
                        <span
                          className="flex items-center gap-1 text-xs cursor-default"
                          style={{ color: 'var(--text-muted)' }}
                          title={absolute}
                        >
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span>{relative}</span>
                          <span
                            className="ml-1 px-1.5 py-0.5 rounded text-xs"
                            style={{ background: 'var(--border)', color: 'var(--text-muted)', fontSize: 10 }}
                          >
                            {absolute}
                          </span>
                        </span>

                        {item.actor.role && (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            · {item.actor.name}
                            <span className="ml-1 opacity-60">({item.actor.role})</span>
                          </span>
                        )}

                        {item.formTitle && (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            · {item.formTitle}
                          </span>
                        )}

                        {item.submissionId && (
                          <Link
                            href={`/form-details/${item.submissionId}`}
                            className="text-xs font-semibold ml-auto"
                            style={{ color: '#3B82F6', textDecoration: 'none' }}
                          >
                            View submission →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load more from API if more pages exist server-side */}
        {nextCursor && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => fetchActivity(nextCursor)}
              disabled={loadingMore}
              className="btn-outline flex items-center gap-2 text-sm"
            >
              {loadingMore
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <RefreshCw className="w-4 h-4" />}
              Load more activity
            </button>
          </div>
        )}

        {/* ── Pagination footer ── */}
        {filtered.length > 0 && totalPages > 1 && (
          <div
            className="mt-6 pt-4 border-t flex flex-wrap items-center justify-between gap-3 text-sm"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            {/* Left: range + page size */}
            <div className="flex items-center gap-3">
              <span>
                Showing <strong style={{ color: 'var(--text)' }}>{rangeStart}–{rangeEnd}</strong>{' '}
                of <strong style={{ color: 'var(--text)' }}>{filtered.length}</strong>
              </span>
              <div className="relative">
                <select
                  value={pageSize}
                  onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="form-input appearance-none pr-6 py-1 text-xs cursor-pointer"
                >
                  {PAGE_SIZE_OPTIONS.map(n => (
                    <option key={n} value={n}>{n} / page</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right: page buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={safePage === 1}
                className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                title="First"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                title="Previous"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {getPageNumbers().map((p, i) =>
                p === '...' ? (
                  <span key={`e-${i}`} className="px-1" style={{ color: 'var(--text-muted)' }}>…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className="min-w-[2rem] h-8 px-2 rounded-lg text-xs font-semibold transition-colors"
                    style={{
                      background: safePage === p ? '#3B82F6' : 'var(--bg)',
                      color: safePage === p ? '#fff' : 'var(--text)',
                      border: `1px solid ${safePage === p ? '#3B82F6' : 'var(--border)'}`,
                    }}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                title="Next"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={safePage === totalPages}
                className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                title="Last"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}