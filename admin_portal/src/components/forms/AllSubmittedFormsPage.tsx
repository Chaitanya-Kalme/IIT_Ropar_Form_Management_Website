'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Filter, Eye, Download, FileText, Loader2, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';

// ── Types ──────────────────────────────────────────────────────────────────────

interface SubmissionUser {
  id: string;
  userName: string;
  email: string;
}

interface SubmissionForm {
  id: number;
  title: string;       // ← schema uses 'title' not 'name'
  formStatus: boolean;
}

interface FormSubmission {
  id: string;          // ← UUID string per schema
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
    APPROVED: 'Approved',
    PENDING:  'Pending',
    REJECTED: 'Rejected',
    Approved: 'Approved',
    Pending:  'Pending',
    Rejected: 'Rejected',
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
    Approved: 'bg-green-500',
    Pending:  'bg-amber-500',
    Rejected: 'bg-red-500',
  };
  return map[status] ?? 'bg-gray-400';
};

const formatDate = (iso: string) => new Date(iso).toISOString().split('T')[0];

const initials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

// ── Component ──────────────────────────────────────────────────────────────────

interface AllSubmittedFormsPageProps {
  formId?:        string;
  initialStatus?: string;
  initialDate?:   string;
  initialSearch?: string;
}

export function AllSubmittedFormsPage({
  formId        = '',
  initialStatus = 'All',
  initialDate   = '',
  initialSearch = '',
}: AllSubmittedFormsPageProps) {
  const router   = useRouter();
  const pathname = usePathname();

  // ── Filter state ────────────────────────────────────────────────────────────
  const [search,       setSearch]       = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [dateFilter,   setDateFilter]   = useState(initialDate);

  // ── Data state ──────────────────────────────────────────────────────────────
  const [data,    setData]    = useState<AllSubmissionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (formId                  ) params.set('formId', formId);   // ← include formId
      if (search                  ) params.set('search', search);
      if (statusFilter !== 'All'  ) params.set('status', statusFilter);
      if (dateFilter              ) params.set('date',   dateFilter);

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

  useEffect(() => {
    setSearch(initialSearch);
    setStatusFilter(initialStatus);
    setDateFilter(initialDate);
  }, [initialSearch, initialStatus, initialDate]);

  // ── URL sync ────────────────────────────────────────────────────────────────
  const updateParams = (updates: Record<string, string>) => {
    const next = { formId, search, status: statusFilter, date: dateFilter, ...updates };
    const nextParams = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => {
      if (v && v !== 'All') nextParams.set(k, v);
    });
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  // ── Clear form filter ───────────────────────────────────────────────────────
  const clearFormFilter = () => {
    const nextParams = new URLSearchParams();
    if (search             ) nextParams.set('search', search);
    if (statusFilter !== 'All') nextParams.set('status', statusFilter);
    if (dateFilter         ) nextParams.set('date', dateFilter);
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  // ── Export ──────────────────────────────────────────────────────────────────
  const handleExport = (format: string) => {
    toast.success(`Exporting ${data?.formSubmissions.length ?? 0} records as ${format}…`);
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-[#1E3A8A]" />
        <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">Loading submissions…</span>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
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

  const submissions      = data.formSubmissions;
  const totalCount       = data._count.formSubmissions;
  const hasActiveFilters = statusFilter !== 'All' || !!dateFilter || !!search;
  const isFormFiltered   = !!data.activeFormId;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>

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
          {['CSV', 'Excel', 'PDF'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => handleExport(fmt)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download size={12} /> {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Form filter banner — only shown when filtering by a specific form */}
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
            onChange={(e) => { setSearch(e.target.value); updateParams({ search: e.target.value }); }}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 dark:text-white"
          />
        </div>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => { setDateFilter(e.target.value); updateParams({ date: e.target.value }); }}
          className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 dark:text-white"
        />

        <div className="flex items-center gap-2">
          <Filter size={15} className="text-gray-400" />
          {['All', 'Approved', 'Pending', 'Rejected'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); updateParams({ status: s }); }}
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

        {/* Clear other filters */}
        {hasActiveFilters && (
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('All');
              setDateFilter('');
              updateParams({ search: '', status: 'All', date: '' });
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
                    {/* User */}
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

                    {/* Email */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText size={13} className="text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{sub.user.email}</span>
                      </div>
                    </td>

                    {/* Form Name — uses title per schema */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {sub.form.title}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(sub.createdAt)}
                    </td>

                    {/* Verifier Level */}
                    <td className="px-6 py-4">
                      <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-[#1E3A8A] dark:text-blue-400 px-2.5 py-1 rounded-full font-medium">
                        Level {sub.currentLevel}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge(displayStatus)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor(displayStatus)}`} />
                        {displayStatus}
                      </span>
                    </td>

                    {/* Actions */}
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
      </div>
    </div>
  );
}