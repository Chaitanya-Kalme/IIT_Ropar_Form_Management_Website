'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Filter, Eye, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { getFormById, mockSubmissions } from '@/data/mockData';

interface AllSubmittedFormsPageProps {
  initialFormId?: string;
  initialStatus?: string;
  initialDate?: string;
  initialSearch?: string;
}

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Approved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    Pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    Rejected: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };
  return map[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
};

export function AllSubmittedFormsPage({
  initialFormId = '',
  initialStatus = 'All',
  initialDate = '',
  initialSearch = '',
}: AllSubmittedFormsPageProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [formIdFilter, setFormIdFilter] = useState(initialFormId);
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [dateFilter, setDateFilter] = useState(initialDate);

  useEffect(() => {
    setFormIdFilter(initialFormId);
    setSearch(initialSearch);
    setStatusFilter(initialStatus);
    setDateFilter(initialDate);
  }, [initialDate, initialFormId, initialSearch, initialStatus]);

  const filteredForm = formIdFilter ? getFormById(formIdFilter) : undefined;

  const updateParams = (updates: Record<string, string>) => {
    const nextParams = new URLSearchParams();
    const nextState = {
      formId: formIdFilter,
      search,
      status: statusFilter,
      date: dateFilter,
      ...updates,
    };

    Object.entries(nextState).forEach(([key, value]) => {
      if (!value || value === 'All') return;
      nextParams.set(key, value);
    });

    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  const filtered = useMemo(() => {
    return mockSubmissions.filter((submission) => {
      const matchesForm = !formIdFilter || submission.formId === formIdFilter;
      const matchesSearch =
        submission.user.toLowerCase().includes(search.toLowerCase()) ||
        submission.formName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || submission.status === statusFilter;
      const matchesDate = !dateFilter || submission.dateSubmitted === dateFilter;

      return matchesForm && matchesSearch && matchesStatus && matchesDate;
    });
  }, [dateFilter, formIdFilter, search, statusFilter]);

  const handleExport = (format: string) => {
    toast.success(`Exporting ${filtered.length} records as ${format}...`);
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
            All Submitted Forms
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {filteredForm ? `${filteredForm.name} submissions` : `${mockSubmissions.length} total submissions`} - view only
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['CSV', 'Excel', 'PDF'].map((format) => (
            <button
              key={format}
              onClick={() => handleExport(format)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download size={12} /> {format}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1E3A8A] text-white rounded-lg flex items-center justify-center flex-shrink-0">
            <Eye size={15} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1E3A8A] dark:text-blue-300">
              {filteredForm ? `Filtered by ${filteredForm.name}` : 'Read-only View'}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
              Admins can only view, search, filter, and export. Detail pages use dummy frontend data.
            </p>
          </div>
        </div>
        {(filteredForm || statusFilter !== 'All' || dateFilter || search) && (
          <Link
            href="/forms/all"
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-white text-[#1E3A8A] border border-blue-200 dark:bg-gray-900 dark:border-blue-800 dark:text-blue-300"
          >
            Clear filters
          </Link>
        )}
      </div>

      <div
        className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 flex flex-wrap gap-3 items-center"
        style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
      >
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user or form name..."
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
              updateParams({ search: value });
            }}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 dark:text-white"
          />
        </div>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => {
            const value = e.target.value;
            setDateFilter(value);
            updateParams({ date: value });
          }}
          className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 dark:text-white"
        />

        <div className="flex items-center gap-2">
          <Filter size={15} className="text-gray-400" />
          {['All', 'Approved', 'Pending', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                updateParams({ status });
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                statusFilter === status
                  ? 'bg-[#1E3A8A] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
        style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                {['User', 'Form Name', 'Date Submitted', 'Verifier Level', 'Status', 'Actions'].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.map((submission) => (
                <tr
                  key={submission.id}
                  className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#1E3A8A] text-white text-xs font-semibold flex items-center justify-center">
                        {submission.user.split(' ').map((name) => name[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{submission.user}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <Link href={`/forms/available/${submission.formId}`} className="flex items-center gap-2 group">
                      <FileText size={13} className="text-gray-400 group-hover:text-[#1E3A8A] transition-colors" />
                      <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-[#1E3A8A] dark:group-hover:text-blue-300 transition-colors">
                        {submission.formName}
                      </span>
                    </Link>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{submission.dateSubmitted}</td>

                  <td className="px-6 py-4">
                    <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-[#1E3A8A] dark:text-blue-400 px-2.5 py-1 rounded-full font-medium">
                      {submission.verifierLevel}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge(submission.status)}`}>
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          submission.status === 'Approved'
                            ? 'bg-green-500'
                            : submission.status === 'Pending'
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                        }`}
                      />
                      {submission.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <Link
                      href={`/forms/all/${submission.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#1E3A8A] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 rounded-lg transition-colors font-medium"
                    >
                      <Eye size={12} /> View Details
                    </Link>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No submissions match your search criteria
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
