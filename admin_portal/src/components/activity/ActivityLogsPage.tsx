'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Filter, Download, Activity, Calendar, User, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { mockActivityLogs } from '@/data/mockData';

const actionTypes = ['All', 'Approved', 'Rejected', 'Created', 'Edited', 'Deleted', 'Exported', 'Added', 'Updated', 'Bulk'];

const actionColor = (action: string): string => {
  if (action.includes('Approved') || action.includes('Verified')) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
  if (action.includes('Rejected')) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
  if (action.includes('Created') || action.includes('Added')) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
  if (action.includes('Deleted') || action.includes('Reset')) return 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
  if (action.includes('Edited') || action.includes('Updated')) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20';
  if (action.includes('Exported')) return 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20';
  if (action.includes('Bulk')) return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20';
  return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
};

const actionDot = (action: string): string => {
  if (action.includes('Approved') || action.includes('Verified')) return 'bg-green-500';
  if (action.includes('Rejected')) return 'bg-red-500';
  if (action.includes('Created') || action.includes('Added')) return 'bg-blue-500';
  if (action.includes('Deleted') || action.includes('Reset')) return 'bg-red-400';
  if (action.includes('Edited') || action.includes('Updated')) return 'bg-amber-500';
  if (action.includes('Exported')) return 'bg-teal-500';
  if (action.includes('Bulk')) return 'bg-purple-500';
  return 'bg-gray-400';
};

interface ActivityLogsPageProps {
  initialAdmin?: string;
}

export function ActivityLogsPage({ initialAdmin = 'All' }: ActivityLogsPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const [adminFilter, setAdminFilter] = useState(initialAdmin);
  const [actionTypeFilter, setActionTypeFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    setAdminFilter(initialAdmin);
  }, [initialAdmin]);

  const admins = ['All', ...Array.from(new Set(mockActivityLogs.map((log) => log.admin)))];

  const filtered = useMemo(() => {
    return mockActivityLogs.filter((log) => {
      const matchSearch = log.action.toLowerCase().includes(search.toLowerCase()) || log.target.toLowerCase().includes(search.toLowerCase()) || log.admin.toLowerCase().includes(search.toLowerCase());
      const matchAdmin = adminFilter === 'All' || log.admin === adminFilter;
      const matchAction = actionTypeFilter === 'All' || log.action.includes(actionTypeFilter);
      const logDate = log.timestamp.slice(0, 10);
      const matchFrom = !dateFrom || logDate >= dateFrom;
      const matchTo = !dateTo || logDate <= dateTo;
      return matchSearch && matchAdmin && matchAction && matchFrom && matchTo;
    });
  }, [actionTypeFilter, adminFilter, dateFrom, dateTo, search]);

  const setAdminAndQuery = (value: string) => {
    setAdminFilter(value);
    const next = new URLSearchParams();
    if (value && value !== 'All') next.set('admin', value);
    router.replace(next.toString() ? `${pathname}?${next.toString()}` : pathname);
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Activity Logs</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {adminFilter !== 'All' ? `Filtered activity for ${adminFilter}` : 'Complete audit trail of all admin actions'}
          </p>
        </div>
        <button onClick={() => toast.success('Exporting activity logs as CSV...')} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <Download size={15} /> Export Logs
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 space-y-3" style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 dark:text-white" />
          </div>

          <div className="flex items-center gap-2">
            <User size={14} className="text-gray-400" />
            <select value={adminFilter} onChange={(e) => setAdminAndQuery(e.target.value)} className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none dark:text-white appearance-none min-w-32">
              {admins.map((admin) => <option key={admin} value={admin}>{admin}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400" />
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none dark:text-white" />
            <span className="text-gray-400 text-xs">to</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none dark:text-white" />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Filter size={14} className="text-gray-400 mt-1 flex-shrink-0" />
          {actionTypes.map((action) => (
            <button key={action} onClick={() => setActionTypeFilter(action)} className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${actionTypeFilter === action ? 'bg-[#1E3A8A] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
              {action}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Actions', value: filtered.length, icon: <Activity size={16} />, color: '#1E3A8A', bg: '#EFF6FF' },
          { label: 'Today', value: filtered.filter((log) => log.timestamp.startsWith('2025-03-06')).length, icon: <Calendar size={16} />, color: '#16A34A', bg: '#F0FDF4' },
          { label: 'This Week', value: filtered.filter((log) => log.timestamp >= '2025-03-01').length, icon: <Hash size={16} />, color: '#7C3AED', bg: '#F5F3FF' },
          { label: 'Active Admins', value: new Set(filtered.map((log) => log.admin)).size, icon: <User size={16} />, color: '#D97706', bg: '#FFFBEB' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 flex items-center gap-3" style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: stat.bg, color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden" style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                {['Timestamp', 'Admin', 'Action Taken', 'Target / Form ID'].map((heading) => <th key={heading} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{heading}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${actionDot(log.action)}`} />
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{log.timestamp}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0" style={{ background: `hsl(${log.admin.charCodeAt(0) * 17 % 360}, 55%, 35%)` }}>
                        {log.admin.split(' ').slice(-1)[0][0]}
                      </div>
                      <span className="text-sm text-gray-800 dark:text-gray-200">{log.admin}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium ${actionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-300 font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-lg">{log.target}</span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No activity logs match your filters</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">Showing <span className="font-medium">{filtered.length}</span> of <span className="font-medium">{mockActivityLogs.length}</span> log entries</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((page) => <button key={page} className={`w-7 h-7 text-xs rounded-lg transition-colors ${page === 1 ? 'bg-[#1E3A8A] text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{page}</button>)}
          </div>
        </div>
      </div>
    </div>
  );
}
