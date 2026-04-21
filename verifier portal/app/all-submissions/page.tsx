'use client';

import { useState, useEffect, useCallback, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import {
  Search, Eye, Download, ChevronDown, Filter,
  Loader2, AlertTriangle, CheckCircle, XCircle, Clock, FileStack,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type DisplayStatus = 'Accepted' | 'Pending' | 'Rejected' | 'Expired';

interface Submission {
  id: string;
  studentName: string;
  email: string;
  formId: number;
  formTitle: string;
  submissionDate: string;
  deadline: string;
  isExpired: boolean;
  status: DisplayStatus;
  overallStatus: string;
  currentLevel: number;
  totalLevels: number;
  currentVerifier: string;
  currentVerifierRole: string;
}

interface Stats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  expired: number;
}

interface FormOption {
  id: number;
  title: string;
}

interface ApiResponse {
  submissions: Submission[];
  stats: Stats;
  formOptions: FormOption[];
}

// ─── Status tab config ────────────────────────────────────────────────────────

const STATUS_TABS: { label: string; key: string; color: string }[] = [
  { label: 'All', key: 'All', color: '#3B82F6' },
  { label: 'Pending', key: 'Pending', color: '#F59E0B' },
  { label: 'Accepted', key: 'Accepted', color: '#22C55E' },
  { label: 'Rejected', key: 'Rejected', color: '#EF4444' },
  { label: 'Expired', key: 'Expired', color: '#94A3B8' },
];

// ─── Inner component ──────────────────────────────────────────────────────────

function SubmissionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filters (instant)
  const [status, setStatus] = useState(searchParams.get('status') ?? 'All');
  const [formId, setFormId] = useState(searchParams.get('formId') ?? '');

  // Committed filter values (used in API call)
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Draft values (typed but not yet committed)
  const [searchDraft, setSearchDraft] = useState(searchParams.get('search') ?? '');
  const [startDraft, setStartDraft] = useState('');
  const [endDraft, setEndDraft] = useState('');

  // Pagination (client-side)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch all matching submissions ────────────────────────────────────────
  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (status && status !== 'All') params.set('status', status);
      if (formId) params.set('formId', formId);
      if (search) params.set('search', search);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const res = await fetch(`/api/verifier/all-submissions?${params.toString()}`);
      if (res.status === 401) { router.push('/login'); return; }
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Failed to load submissions');
      }


      setData(await res.json());
      setPage(1); // reset to first page on every new fetch
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [status, formId, search, startDate, endDate, router]);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  // ── Commit helpers ────────────────────────────────────────────────────────
  const commitSearch = () => setSearch(searchDraft);
  const commitDates = () => { setStartDate(startDraft); setEndDate(endDraft); };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitSearch();
  };
  const handleDateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitDates();
  };

  // ── Clear ─────────────────────────────────────────────────────────────────
  const clearFilters = () => {
    setSearchDraft(''); setSearch('');
    setStartDraft(''); setStartDate('');
    setEndDraft(''); setEndDate('');
    setStatus('All'); setFormId('');
    setPage(1);
  };

  // ── Export CSV (exports ALL submissions, not just current page) ───────────
  const exportCSV = () => {
    if (!data) return;
    const csv = [
      'Student,Email,Form,Submitted,Status,Current Verifier,Level',
      ...data.submissions.map(s =>
        `${s.studentName},${s.email},${s.formTitle},` +
        `${new Date(s.submissionDate).toLocaleDateString()},` +
        `${s.status},${s.currentVerifier},${s.currentLevel}/${s.totalLevels}`
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'submissions.csv'; a.click();
  };

  // ── Export PDF (builds an HTML page and uses browser print-to-PDF) ────────
  const exportPDF = () => {
    if (!data) return;
    const rows = data.submissions.map(s => `
      <tr>
        <td>${s.studentName}<br/><span class="sub">${s.email}</span></td>
        <td>${s.formTitle}</td>
        <td>${new Date(s.submissionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
        <td><span class="badge ${s.status.toLowerCase()}">${s.status}</span></td>
        <td>${s.currentVerifier}<br/><span class="sub">${s.currentVerifierRole}</span></td>
        <td>L${s.currentLevel}/${s.totalLevels}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Submissions Export</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #1e293b; padding: 24px; }
    h1 { font-size: 18px; margin-bottom: 4px; }
    .meta { color: #64748b; font-size: 11px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f1f5f9; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #475569; border-bottom: 2px solid #e2e8f0; }
    td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    tr:hover td { background: #fafafa; }
    .sub { color: #94a3b8; font-size: 11px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; }
    .badge.accepted { background: #dcfce7; color: #16a34a; }
    .badge.pending  { background: #fef9c3; color: #b45309; }
    .badge.rejected { background: #fee2e2; color: #dc2626; }
    .badge.expired  { background: #f1f5f9; color: #64748b; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>All Submissions</h1>
  <p class="meta">Exported on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} &nbsp;·&nbsp; ${data.submissions.length} records</p>
  <table>
    <thead>
      <tr>
        <th>Student</th><th>Form</th><th>Submitted</th><th>Status</th><th>Current Verifier</th><th>Level</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  };

  // ── Client-side pagination slice ──────────────────────────────────────────
  const allSubmissions = data?.submissions ?? [];
  const total = allSubmissions.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const pagedSubmissions = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return allSubmissions.slice(start, start + pageSize);
  }, [allSubmissions, safePage, pageSize]);

  // ── Page number window (show max 5 buttons) ───────────────────────────────
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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--text-muted)' }} />
        <span className="ml-2 text-sm" style={{ color: 'var(--text-muted)' }}>Loading submissions...</span>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertTriangle className="w-8 h-8 text-red-400" />
        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{error ?? 'No data found'}</p>
        <button onClick={fetchSubmissions} className="btn-outline text-sm">Retry</button>
      </div>
    );
  }

  const { stats, formOptions } = data;
  const hasFilters = searchDraft || search || status !== 'All' || formId || startDraft || startDate || endDraft || endDate;

  const rangeStart = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, total);

  const statCards = [
    { key: 'total', label: 'Total', value: stats.total, icon: FileStack, color: '#3B82F6', bg: '#EFF6FF' },
    { key: 'pending', label: 'Pending', value: stats.pending, icon: Clock, color: '#F59E0B', bg: '#FFFBEB' },
    { key: 'accepted', label: 'Accepted', value: stats.accepted, icon: CheckCircle, color: '#22C55E', bg: '#F0FDF4' },
    { key: 'rejected', label: 'Rejected', value: stats.rejected, icon: XCircle, color: '#EF4444', bg: '#FFF5F5' },
    { key: 'expired', label: 'Expired', value: stats.expired, icon: AlertTriangle, color: '#94A3B8', bg: '#F8FAFC' },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>All Submissions</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {total === 0
              ? 'No submissions found'
              : <>Showing <strong style={{ color: 'var(--text)' }}>{rangeStart}–{rangeEnd}</strong> of <strong style={{ color: 'var(--text)' }}>{total}</strong> submissions</>
            }
          </p>
        </div>
        <div className="export-group">
          <button onClick={exportCSV} className="btn-outline">
            <Download className="w-4 h-4 text-green-500" /> Export CSV
          </button>
          <button onClick={exportPDF} className="btn-outline">
            <Download className="w-4 h-4 text-red-400" /> Export PDF
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        {statCards.map(({ key, label, value, icon: Icon, color, bg }) => (
          <div
            key={key}
            className="content-card p-4 cursor-pointer transition-all hover:shadow-md"
            onClick={() => setStatus(key === 'total' ? 'All' : label)}
            style={{ outline: status === (key === 'total' ? 'All' : label) ? `2px solid ${color}` : 'none' }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: bg }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Status tabs + form dropdown */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 items-center">
        {STATUS_TABS.map(({ label, key, color }) => {
          const count = key === 'All' ? stats.total
            : key === 'Pending' ? stats.pending
              : key === 'Accepted' ? stats.accepted
                : key === 'Rejected' ? stats.rejected
                  : stats.expired;
          const active = status === key;
          return (
            <button
              key={key}
              onClick={() => setStatus(key)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
              style={{
                background: active ? `${color}18` : 'var(--card)',
                color: active ? color : 'var(--text-muted)',
                border: `1px solid ${active ? color + '40' : 'var(--border)'}`,
                cursor: 'pointer',
              }}
            >
              {label}
              <span
                className="px-1.5 py-0.5 rounded-md text-xs"
                style={{
                  background: active ? color + '25' : 'var(--bg)',
                  color: active ? color : 'var(--text-muted)',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}

        {formOptions.length > 1 && (
          <div className="relative min-w-48 ml-auto">
            <select
              value={formId}
              onChange={e => setFormId(e.target.value)}
              className="form-input appearance-none pr-8 cursor-pointer"
            >
              <option value="">All Forms</option>
              {formOptions.map(f => (
                <option key={f.id} value={f.id}>{f.title}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: 'var(--text-muted)' }} />
          </div>
        )}
      </div>

      {/* Search + date filters */}
      <div className="content-card mb-5">
        <div className="p-4 flex flex-wrap gap-3 items-end">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              value={searchDraft}
              onChange={e => setSearchDraft(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onBlur={commitSearch}
              placeholder="Search by student name or email… (press Enter)"
              className="form-input pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDraft}
              onChange={e => setStartDraft(e.target.value)}
              onKeyDown={handleDateKeyDown}
              onBlur={commitDates}
              className="form-input"
              title="From date (press Enter to apply)"
            />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>to</span>
            <input
              type="date"
              value={endDraft}
              onChange={e => setEndDraft(e.target.value)}
              onKeyDown={handleDateKeyDown}
              onBlur={commitDates}
              className="form-input"
              title="To date (press Enter to apply)"
            />
          </div>

          {hasFilters && (
            <button onClick={clearFilters} className="btn-outline flex items-center gap-1.5">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="content-card">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Form</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Current Verifier</th>
                <th>Level</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pagedSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Filter className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
                      <p className="font-semibold" style={{ color: 'var(--text)' }}>No submissions match your filters</p>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedSubmissions.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: `hsl(${s.studentName.charCodeAt(0) * 7},60%,50%)` }}
                        >
                          {s.studentName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{s.studentName}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.email}</p>
                        </div>
                      </div>
                    </td>

                    <td>
                      <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>{s.formTitle}</p>
                    </td>

                    <td className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {new Date(s.submissionDate).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>

                    <td>
                      <span className={`badge badge-${s.status.toLowerCase()}`}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor' }} />
                        {s.status}
                      </span>
                    </td>

                    <td>
                      <p className="text-sm" style={{ color: 'var(--text)' }}>{s.currentVerifier}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.currentVerifierRole}</p>
                    </td>

                    <td>
                      <div className="flex items-center gap-1 text-sm">
                        <span className="font-bold" style={{ color: '#3B82F6' }}>L{s.currentLevel}</span>
                        <span style={{ color: 'var(--text-muted)' }}>/{s.totalLevels}</span>
                      </div>
                    </td>

                    <td>
                      <Link
                        href={`/form-details/${s.id}`}
                        className="flex items-center gap-1.5 text-sm font-semibold"
                        style={{ color: '#3B82F6', textDecoration: 'none' }}
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination footer ── */}
        {total > 0 && (
          <div
            className="px-6 py-3 border-t flex flex-wrap items-center justify-between gap-3 text-sm"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            {/* Left: range label + rows-per-page */}
            <div className="flex items-center gap-3">
              <span>
                Showing{' '}
                <strong style={{ color: 'var(--text)' }}>{rangeStart}–{rangeEnd}</strong>
                {' '}of{' '}
                <strong style={{ color: 'var(--text)' }}>{total}</strong>
              </span>

              <div className="relative">
                <select
                  value={pageSize}
                  onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="form-input appearance-none pr-6 py-1 text-xs cursor-pointer"
                >
                  {[10, 20, 50, 100].map(n => (
                    <option key={n} value={n}>{n} / page</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none"
                  style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>

            {/* Right: page buttons */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(1)}
                  disabled={safePage === 1}
                  className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                  title="First page"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                  title="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {getPageNumbers().map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-1" style={{ color: 'var(--text-muted)' }}>…</span>
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
                  title="Next page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setPage(totalPages)}
                  disabled={safePage === totalPages}
                  className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                  title="Last page"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────

export default function AllSubmissionsPage() {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--text-muted)' }} />
            <span className="ml-2 text-sm" style={{ color: 'var(--text-muted)' }}>Loading submissions...</span>
          </div>
        }
      >
        <SubmissionsContent />
      </Suspense>
    </DashboardLayout>
  );
}