'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Download, Users, Mail, Calendar, RefreshCw, AlertCircle, Phone, Building2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface Verifier {
  id: string;
  userName: string;
  email: string;
  role: string;
  department: string;
  mobileNo: string;
  createdAt: string;
  updatedAt: string;
}

export default function UsersDirectoryPage() {
  const [users, setUsers] = useState<Verifier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/admin/getAllMembers');
      setUsers(response.data.data);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : 'An unexpected error occurred';
      setError(message);
      toast.error(`Failed to load members: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Derive unique roles from fetched data for filter buttons
  const uniqueRoles = ['All', ...Array.from(new Set(users.map(u => u.role)))];

  const filtered = users.filter(u => {
    const matchSearch =
      u.userName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleExport = (format: string) => {
    toast.success(`Exporting ${filtered.length} members as ${format}...`);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const getRoleBadge = (role: string) => {
    const styles: Record<string, { bg: string; text: string; border: string }> = {
      ADMIN: {
        bg: 'bg-red-50 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-200 dark:border-red-700',
      },
      VERIFIER: {
        bg: 'bg-blue-50 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-700',
      },
      VIEWER: {
        bg: 'bg-green-50 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-200 dark:border-green-700',
      },
    };
    const s = styles[role] ?? {
      bg: 'bg-gray-50 dark:bg-gray-800',
      text: 'text-gray-600 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
    };
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${s.bg} ${s.text} ${s.border}`}
      >
        <ShieldCheck size={11} />
        {role}
      </span>
    );
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Members Directory
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {loading
              ? 'Loading members...'
              : error
              ? 'Failed to load members'
              : `${users.length} registered verifiers — read-only database`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          {['CSV', 'Excel', 'PDF'].map(fmt => (
            <button
              key={fmt}
              onClick={() => handleExport(fmt)}
              disabled={loading || !!error}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-white bg-[#1E3A8A] hover:bg-[#1e3a8a]/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-lg shadow-blue-900/20"
            >
              <Download size={14} /> Export {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-300">Failed to fetch members</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{error}</p>
          </div>
          <button
            onClick={fetchUsers}
            className="ml-auto text-xs font-medium text-red-700 dark:text-red-300 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Total Members',
            value: loading ? '—' : users.length,
            icon: <Users size={18} />,
            color: '#1E3A8A',
            bg: '#EFF6FF',
          },
          {
            label: 'Departments',
            value: loading ? '—' : new Set(users.map(u => u.department)).size,
            icon: <Building2 size={18} />,
            color: '#7C3AED',
            bg: '#F5F3FF',
          },
          {
            label: 'Unique Roles',
            value: loading ? '—' : new Set(users.map(u => u.role)).size,
            icon: <ShieldCheck size={18} />,
            color: '#065F46',
            bg: '#ECFDF5',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 flex items-center gap-3"
            style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: stat.bg, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 flex flex-wrap gap-3 items-center"
        style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
      >
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {uniqueRoles.map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                roleFilter === role
                  ? 'bg-[#1E3A8A] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {role}
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
                {['Member', 'Email', 'Role', 'Department', 'Mobile', 'Joined'].map(h => (
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
              {/* Loading skeleton */}
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-800">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                        <div className="space-y-1.5">
                          <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="h-2.5 w-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                        </div>
                      </div>
                    </td>
                    {[1, 2, 3, 4, 5].map(j => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}

              {/* Data rows */}
              {!loading &&
                !error &&
                filtered.map(user => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full text-white text-sm font-semibold flex items-center justify-center flex-shrink-0"
                          style={{
                            background: `hsl(${user.userName.charCodeAt(0) * 7 % 360}, 60%, 40%)`,
                          }}
                        >
                          {user.userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.userName}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            ID: {user.id.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Mail size={12} className="text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={12} className="text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{user.department}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Phone size={12} className="text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">{user.mobileNo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(user.createdAt)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}

              {/* Empty state */}
              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {users.length === 0
                      ? 'No members found in the database'
                      : 'No members found matching your search'}
                  </td>
                </tr>
              )}

              {/* Error empty state */}
              {!loading && error && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Could not load members. Please retry.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {loading ? (
              'Loading...'
            ) : (
              <>
                Showing <span className="font-medium">{filtered.length}</span> of{' '}
                <span className="font-medium">{users.length}</span> members
              </>
            )}
          </p>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map(p => (
              <button
                key={p}
                className={`w-7 h-7 text-xs rounded-lg transition-colors ${
                  p === 1
                    ? 'bg-[#1E3A8A] text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}