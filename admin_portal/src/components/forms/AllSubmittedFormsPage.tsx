'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search, Filter, Eye, Download, FileText, Loader2,
  AlertCircle, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import { toast } from 'sonner';

// ── Types ──────────────────────────────────────────────────────────────────────

interface SubmissionUser {
  id: string;
  userName: string;
  email: string;
}

interface SubmissionForm {
  id: number;
  title: string;
  formStatus: boolean;
}

interface FormSubmission {
  id: string;
  overallStatus: string;
  currentLevel: number;
  createdAt: string;
  updatedAt: string;
  user: SubmissionUser;
  form: SubmissionForm;
}

interface AllSubmissionsData {
  formSubmissions: FormSubmission[];
  _count: { formSubmissions: number };
  activeFormId: number | null;
  activeFormTitle: string | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const normalizeStatus = (raw: string): string => {
  const map: Record<string, string> = {
    APPROVED: 'Approved', PENDING: 'Pending', REJECTED: 'Rejected',
    Approved: 'Approved', Pending:  'Pending', Rejected: 'Rejected',
  };
  return map[raw] ?? raw;
};

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Approved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    Pending:  'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    Rejected: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };
  return map[status] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
};

const dotColor = (status: string) => {
  const map: Record<string, string> = {
    Approved: 'bg-green-500', Pending: 'bg-amber-500', Rejected: 'bg-red-500',
  };
  return map[status] ?? 'bg-gray-400';
};

const formatDate = (iso: string) => new Date(iso).toISOString().split('T')[0];

const initials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

// ── Export Helpers ─────────────────────────────────────────────────────────────

const toRows = (submissions: FormSubmission[]) =>
  submissions.map((sub) => ({
    User:             sub.user.userName,
    Email:            sub.user.email,
    'Form Name':      sub.form.title,
    'Date Submitted': formatDate(sub.createdAt),
    'Verifier Level': `Level ${sub.currentLevel}`,
    Status:           normalizeStatus(sub.overallStatus),
  }));

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const exportCSV = (submissions: FormSubmission[], filename = 'submissions') => {
  const rows   = toRows(submissions);
  const header = Object.keys(rows[0] ?? {});
  const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [
    header.map(escape).join(','),
    ...rows.map((r) => header.map((h) => escape((r as any)[h])).join(',')),
  ].join('\r\n');
  triggerDownload(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`);
};

const exportExcel = async (submissions: FormSubmission[], filename = 'submissions') => {
  try {
    // @ts-ignore
    const XLSX: any = await import('https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs');
    const ws = XLSX.utils.json_to_sheet(toRows(submissions));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Submissions');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch {
    toast.error('Excel export unavailable — downloading as CSV instead.');
    exportCSV(submissions, filename);
  }
};

const exportPDF = (submissions: FormSubmission[], title: string) => {
  const rows = toRows(submissions);
  if (!rows.length) { toast.error('No submissions to export.'); return; }
  const header  = Object.keys(rows[0]);
  const thCells = header.map((h) => `<th>${h}</th>`).join('');
  const trRows  = rows.map((r) =>
    `<tr>${header.map((h) => `<td>${(r as any)[h]}</td>`).join('')}</tr>`
  ).join('');
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;font-size:12px;padding:24px;color:#111}
  h1{font-size:18px;margin-bottom:4px;color:#1E3A8A}
  p{font-size:11px;color:#555;margin-bottom:16px}
  table{width:100%;border-collapse:collapse}
  th,td{border:1px solid #d1d5db;padding:7px 10px;text-align:left}
  th{background:#1E3A8A;color:#fff;font-size:11px;text-transform:uppercase;letter-spacing:.04em}
  tr:nth-child(even) td{background:#f3f4f6}
  @media print{body{padding:0}}
</style></head><body>
  <h1>${title}</h1>
  <p>Exported on ${new Date().toLocaleDateString()} · ${rows.length} record${rows.length !== 1 ? 's' : ''}</p>
  <table><thead><tr>${thCells}</tr></thead><tbody>${trRows}</tbody></table>
</body></html>`;
  const win = window.open('', '_blank');
  if (!win) { toast.error('Pop-ups are blocked — please allow them and try again.'); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 400);
};

// ── Pagination Component ───────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

interface PaginationProps {
  currentPage:  number;
  totalPages:   number;
  pageSize:     number;
  totalCount:   number;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
}

function Pagination({
  currentPage, totalPages, pageSize, totalCount,
  onPageChange, onSizeChange,
}: PaginationProps) {
  const from = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to   = Math.min(currentPage * pageSize, totalCount);

  const pages = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const result: (number | '...')[] = [1];
    if (currentPage > 3)               result.push('...');
    for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p++) {
      result.push(p);
    }
    if (currentPage < totalPages - 2)  result.push('...');
    result.push(totalPages);
    return result;
  };

  const base     = 'h-8 min-w-[2rem] px-2 flex items-center justify-center rounded-lg text-xs font-medium transition-colors';
  const active   = `${base} bg-[#1E3A8A] text-white`;
  const normal   = `${base} bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600`;
  const disabled = `${base} bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed`;

  const isFirst = currentPage === 1;
  const isLast  = currentPage === totalPages || totalPages === 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-7">
      {/* Left: range info + rows-per-page */}
      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span>{totalCount === 0 ? 'No results' : `${from}–${to} of ${totalCount}`}</span>
        <span className="text-gray-300 dark:text-gray-600 select-none">|</span>
        <label htmlFor="page-size-select" className="sr-only">Rows per page</label>
        <span>Rows per page:</span>
        <select
          id="page-size-select"
          value={pageSize}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30"
        >
          {PAGE_SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Right: page buttons */}
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(1)}               disabled={isFirst} className={isFirst ? disabled : normal} aria-label="First page"><ChevronsLeft  size={13} /></button>
        <button onClick={() => onPageChange(currentPage - 1)} disabled={isFirst} className={isFirst ? disabled : normal} aria-label="Previous page"><ChevronLeft   size={13} /></button>

        {pages().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-xs text-gray-400 select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={p === currentPage ? active : normal}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        <button onClick={() => onPageChange(currentPage + 1)} disabled={isLast} className={isLast ? disabled : normal} aria-label="Next page"><ChevronRight  size={13} /></button>
        <button onClick={() => onPageChange(totalPages)}      disabled={isLast} className={isLast ? disabled : normal} aria-label="Last page"><ChevronsRight size={13} /></button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface AllSubmittedFormsPageProps {
  formId?:        string;
  initialStatus?: string;
  initialDate?:   string;
  initialSearch?: string;
  initialPage?:   number;
  initialSize?:   number;
}

export function AllSubmittedFormsPage({
  formId        = '',
  initialStatus = 'All',
  initialDate   = '',
  initialSearch = '',
  initialPage   = 1,
  initialSize   = 10,
}: AllSubmittedFormsPageProps) {
  const router   = useRouter();
  const pathname = usePathname();

  // ── Filter state ──────────────────────────────────────────────────────────────
  const [search,       setSearch]       = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [dateFilter,   setDateFilter]   = useState(initialDate);

  // ── Pagination state ──────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize,    setPageSize]    = useState(initialSize);

  // ── Data state ────────────────────────────────────────────────────────────────
  const [data,    setData]    = useState<AllSubmissionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (formId              ) params.set('formId',  formId);
      if (search              ) params.set('search',  search);
      if (statusFilter !== 'All') params.set('status', statusFilter);
      if (dateFilter          ) params.set('date',    dateFilter);
      // Note: page/limit are handled client-side; not sent to API

      const res  = await fetch(`/api/submissions/getAllSubmissions?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message ?? 'Failed to fetch submissions.');
      setData(json.data as AllSubmissionsData);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, [formId, search, statusFilter, dateFilter]);

  useEffect(() => {
    const id = setTimeout(fetchAll, search ? 400 : 0);
    return () => clearTimeout(id);
  }, [fetchAll, search]);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, dateFilter, pageSize]);

  useEffect(() => {
    setSearch(initialSearch);
    setStatusFilter(initialStatus);
    setDateFilter(initialDate);
  }, [initialSearch, initialStatus, initialDate]);

  // ── URL sync ──────────────────────────────────────────────────────────────────
  const buildParams = (overrides: Record<string, string>) => {
    const merged = {
      formId, search, status: statusFilter, date: dateFilter,
      page: String(currentPage), limit: String(pageSize),
      ...overrides,
    };
    const p = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => {
      if (v && v !== 'All' && !(k === 'page' && v === '1') && !(k === 'limit' && v === '10')) {
        p.set(k, v);
      }
    });
    return p.toString();
  };

  const pushParams = (overrides: Record<string, string>) => {
    const query = buildParams(overrides);
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    pushParams({ page: String(page) });
  };

  const handleSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    pushParams({ limit: String(size), page: '1' });
  };

  // ── Clear form filter ─────────────────────────────────────────────────────────
  const clearFormFilter = () => {
    const p = new URLSearchParams();
    if (search              ) p.set('search', search);
    if (statusFilter !== 'All') p.set('status', statusFilter);
    if (dateFilter          ) p.set('date', dateFilter);
    const query = p.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  // ── Export ────────────────────────────────────────────────────────────────────
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (format: string) => {
    if (!data || data.formSubmissions.length === 0) {
      toast.error('No submissions to export.');
      return;
    }
    const submissions = data.formSubmissions;
    const filename    = data.activeFormTitle
      ? `submissions-${data.activeFormTitle.replace(/\s+/g, '-').toLowerCase()}`
      : 'submissions';

    setExporting(format);
    try {
      if (format === 'CSV') {
        exportCSV(submissions, filename);
        toast.success(`Exported ${submissions.length} records as CSV.`);
      } else if (format === 'Excel') {
        await exportExcel(submissions, filename);
        toast.success(`Exported ${submissions.length} records as Excel.`);
      } else if (format === 'PDF') {
        exportPDF(
          submissions,
          data.activeFormTitle ? `Submissions — ${data.activeFormTitle}` : 'All Submitted Forms',
        );
      }
    } catch {
      toast.error(`Failed to export as ${format}.`);
    } finally {
      setExporting(null);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────────
  const allSubmissions   = data?.formSubmissions ?? [];
  const totalCount       = allSubmissions.length;
  const totalPages       = Math.max(1, Math.ceil(totalCount / pageSize));
  const safeCurrentPage  = Math.min(currentPage, totalPages);
  const sliceStart       = (safeCurrentPage - 1) * pageSize;
  const submissions      = allSubmissions.slice(sliceStart, sliceStart + pageSize);
  const hasActiveFilters = statusFilter !== 'All' || !!dateFilter || !!search;
  const isFormFiltered   = !!data?.activeFormId;

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-[#1E3A8A]" />
        <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">Loading submissions…</span>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {error ?? 'No data found.'}
        </p>
        <button
          onClick={fetchAll}
          className="px-4 py-2 text-xs font-semibold bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1e3a8a]/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-10" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
            All Submitted Forms
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {isFormFiltered
              ? `${totalCount} submission${totalCount !== 1 ? 's' : ''} for "${data.activeFormTitle}"`
              : `${totalCount} total submission${totalCount !== 1 ? 's' : ''} across all forms`
            }
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['CSV', 'Excel', 'PDF'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => handleExport(fmt)}
              disabled={!!exporting}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {exporting === fmt ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Form filter banner */}
      {isFormFiltered && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1E3A8A] text-white rounded-lg flex items-center justify-center flex-shrink-0">
              <Eye size={15} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1E3A8A] dark:text-blue-300">
                Filtered by form: {data.activeFormTitle}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                Showing submissions for this form only. Remove the filter to see all submissions.
              </p>
            </div>
          </div>
          <button
            onClick={clearFormFilter}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-white text-[#1E3A8A] border border-blue-200 dark:bg-gray-900 dark:border-blue-800 dark:text-blue-300 hover:bg-blue-50 transition-colors"
          >
            <X size={12} /> Remove form filter
          </button>
        </div>
      )}

      {/* Filters */}
      <div
        className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 flex flex-wrap gap-3 items-center"
        style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
      >
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); pushParams({ search: e.target.value, page: '1' }); }}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 dark:text-white"
          />
        </div>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => { setDateFilter(e.target.value); pushParams({ date: e.target.value, page: '1' }); }}
          className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 dark:text-white"
        />

        <div className="flex items-center gap-2">
          <Filter size={15} className="text-gray-400" />
          {['All', 'Approved', 'Pending', 'Rejected'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); pushParams({ status: s, page: '1' }); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                statusFilter === s
                  ? 'bg-[#1E3A8A] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button
            onClick={() => {
              setSearch(''); setStatusFilter('All'); setDateFilter(''); setCurrentPage(1);
              pushParams({ search: '', status: 'All', date: '', page: '1' });
            }}
            className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
        style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                {['User', 'Email', 'Form Name', 'Date Submitted', 'Verifier Level', 'Status', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {submissions.map((sub) => {
                const displayStatus = normalizeStatus(sub.overallStatus);
                return (
                  <tr
                    key={sub.id}
                    className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#1E3A8A] text-white text-xs font-semibold flex items-center justify-center">
                          {initials(sub.user.userName)}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {sub.user.userName}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText size={13} className="text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{sub.user.email}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {sub.form.title}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(sub.createdAt)}
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-[#1E3A8A] dark:text-blue-400 px-2.5 py-1 rounded-full font-medium">
                        Level {sub.currentLevel}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge(displayStatus)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor(displayStatus)}`} />
                        {displayStatus}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <Link
                        href={`/forms/all/${sub.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#1E3A8A] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 rounded-lg transition-colors font-medium"
                      >
                        <Eye size={12} /> View Details
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {submissions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {isFormFiltered
                      ? `No submissions found for "${data.activeFormTitle}".`
                      : 'No submissions match your search criteria.'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination — lives inside the card below the table */}
        <div className="border-t border-gray-100 dark:border-gray-800 px-4">
          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={handlePageChange}
            onSizeChange={handleSizeChange}
          />
        </div>
      </div>
    </div>
  );
}