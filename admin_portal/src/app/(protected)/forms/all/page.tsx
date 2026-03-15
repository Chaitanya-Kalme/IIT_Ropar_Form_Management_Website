'use client';

import React, { useState } from 'react';
import { Search, Filter, Eye, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { mockSubmissions } from '@/data/mockData';

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Approved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    Pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    Rejected: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };
  return map[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
};

export default function AllSubmittedFormsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  const filtered = mockSubmissions.filter((s) => {
    const matchSearch =
      s.user.toLowerCase().includes(search.toLowerCase()) ||
      s.formName.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === 'All' || s.status === statusFilter;

    const matchDate =
      !dateFilter ||
      new Date(s.dateSubmitted).toISOString().split('T')[0] === dateFilter;

    return matchSearch && matchStatus && matchDate;
  });

  const handleExport = (format: string) => {
    toast.success(`Exporting ${filtered.length} records as ${format}...`);
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
            All Submitted Forms
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {mockSubmissions.length} total submissions — view only
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

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#1E3A8A] text-white rounded-lg flex items-center justify-center flex-shrink-0">
          <Eye size={15} />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#1E3A8A] dark:text-blue-300">
            Read-only View
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
            Admins can only view, search, filter, and export. Approve/Reject actions are disabled here.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div
        className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 flex flex-wrap gap-3 items-center"
        style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user or form name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 dark:text-white"
          />
        </div>

        {/* Date Filter */}
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 dark:text-white"
        />

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-gray-400" />
          {['All', 'Approved', 'Pending', 'Rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
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
                {['User', 'Form Name', 'Date Submitted', 'Verifier Level', 'Status', 'Actions'].map((h) => (
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
              {filtered.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {/* User */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#1E3A8A] text-white text-xs font-semibold flex items-center justify-center">
                        {sub.user.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {sub.user}
                      </span>
                    </div>
                  </td>

                  {/* Form */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText size={13} className="text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {sub.formName}
                      </span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {sub.dateSubmitted}
                  </td>

                  {/* Verifier */}
                  <td className="px-6 py-4">
                    <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-[#1E3A8A] dark:text-blue-400 px-2.5 py-1 rounded-full font-medium">
                      {sub.verifierLevel}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge(
                        sub.status
                      )}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          sub.status === 'Approved'
                            ? 'bg-green-500'
                            : sub.status === 'Pending'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                      />
                      {sub.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toast.info(`Viewing details for ${sub.user}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#1E3A8A] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 rounded-lg transition-colors font-medium"
                    >
                      <Eye size={12} /> View Details
                    </button>
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