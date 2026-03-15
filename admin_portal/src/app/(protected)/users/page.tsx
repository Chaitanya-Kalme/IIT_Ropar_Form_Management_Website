'use client';

import React, { useState } from 'react';
import { Search, Download, Users, Mail, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { mockUsers } from '@/data/mockData';

export default function UsersDirectoryPage() {
  const [search, setSearch] = useState('');
  const [authFilter, setAuthFilter] = useState('All');

  const filtered = mockUsers.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchAuth = authFilter === 'All' || u.authMethod === authFilter;
    return matchSearch && matchAuth;
  });

  const handleExport = (format: string) => {
    toast.success(`Exporting ${filtered.length} users as ${format}...`);
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Users Directory</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {mockUsers.length} registered users — read-only database
          </p>
        </div>
        <div className="flex items-center gap-2">
          {['CSV', 'Excel', 'PDF'].map(fmt => (
            <button
              key={fmt}
              onClick={() => handleExport(fmt)}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-white bg-[#1E3A8A] hover:bg-[#1e3a8a]/90 rounded-xl transition-colors shadow-lg shadow-blue-900/20"
            >
              <Download size={14} /> Export {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: mockUsers.length, icon: <Users size={18} />, color: '#1E3A8A', bg: '#EFF6FF' },
          { label: 'Google Auth', value: mockUsers.filter(u => u.authMethod === 'Google').length, icon: <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>, color: '#1a73e8', bg: '#EFF6FF' },
          { label: 'Email Auth', value: mockUsers.filter(u => u.authMethod === 'Email').length, icon: <Mail size={18} />, color: '#7C3AED', bg: '#F5F3FF' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 flex items-center gap-3"
            style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: stat.bg, color: stat.color }}>
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
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 flex flex-wrap gap-3 items-center"
        style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          {['All', 'Google', 'Email'].map(m => (
            <button
              key={m}
              onClick={() => setAuthFilter(m)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                authFilter === m
                  ? 'bg-[#1E3A8A] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
        style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                {['User', 'Email', 'Auth Method', 'Registration Date', 'Forms Submitted'].map(h => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full text-white text-sm font-semibold flex items-center justify-center flex-shrink-0"
                        style={{ background: `hsl(${user.name.charCodeAt(0) * 7 % 360}, 60%, 40%)` }}
                      >
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">ID: {user.id.toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Mail size={12} className="text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.authMethod === 'Google' ? (
                      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-medium border border-blue-200 dark:border-blue-700">
                        <svg className="w-3 h-3" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                        Google SSO
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full font-medium border border-purple-200 dark:border-purple-700">
                        <Mail size={11} /> Email
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">{user.registeredDate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{user.formsSubmitted}</span>
                      <div className="flex-1 max-w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-[#1E3A8A] h-1.5 rounded-full"
                          style={{ width: `${(user.formsSubmitted / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No users found matching your search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing <span className="font-medium">{filtered.length}</span> of <span className="font-medium">{mockUsers.length}</span> users
          </p>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map(p => (
              <button key={p} className={`w-7 h-7 text-xs rounded-lg transition-colors ${p === 1 ? 'bg-[#1E3A8A] text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
