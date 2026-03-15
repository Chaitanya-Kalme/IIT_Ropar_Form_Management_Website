'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, MoreVertical, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { mockForms } from '@/data/mockData';

type FormStatus = 'Active' | 'Draft';

interface Form {
  id: string;
  name: string;
  createdDate: string;
  status: string;
  deadline: string;
  submissionsCount: number;
}

export default function AvailableFormsPage() {
  const [forms, setForms] = useState<Form[]>(mockForms);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = forms.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || f.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleStatus = (id: string) => {
    setForms(prev => prev.map(f =>
      f.id === id ? { ...f, status: f.status === 'Active' ? 'Draft' : 'Active' } : f
    ));
    const form = forms.find(f => f.id === id);
    toast.success(`Form ${form?.status === 'Active' ? 'deactivated' : 'activated'} successfully`);
    setOpenMenu(null);
  };

  const deleteForm = (id: string) => {
    setForms(prev => prev.filter(f => f.id !== id));
    toast.success('Form deleted successfully');
    setDeleteConfirm(null);
    setOpenMenu(null);
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Available Forms</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{forms.length} forms total</p>
        </div>
        <Link
          href="/forms/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1E3A8A] text-white text-sm font-semibold rounded-xl hover:bg-[#1e3a8a]/90 transition-all shadow-lg shadow-blue-900/20"
        >
          <Plus size={16} />
          Create New Form
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 flex flex-wrap gap-3 items-center"
        style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search forms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-gray-400" />
          {['All', 'Active', 'Draft'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${statusFilter === s
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
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
        style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                {['Form Name', 'Created Date', 'Status', 'Deadline', 'Submissions', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((form) => (
                <tr key={form.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 text-[#1E3A8A] dark:text-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Eye size={14} />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{form.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{form.createdDate}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${form.status === 'Active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${form.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {form.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{form.deadline}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{form.submissionsCount}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">submissions</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === form.id ? null : form.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openMenu === form.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                          <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden py-1">
                            <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                              onClick={() => { toast.info(`Edit form: ${form.name}`); setOpenMenu(null); }}>
                              <Edit2 size={14} /> Edit
                            </button>
                            <button
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                              onClick={() => toggleStatus(form.id)}
                            >
                              {form.status === 'Active' ? <><ToggleLeft size={14} /> Deactivate</> : <><ToggleRight size={14} className="text-green-500" /> Activate</>}
                            </button>
                            <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
                            <button
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                              onClick={() => setDeleteConfirm(form.id)}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No forms found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">Showing {filtered.length} of {forms.length} forms</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map(p => (
              <button key={p} className={`w-7 h-7 text-xs rounded-lg transition-colors ${p === 1 ? 'bg-[#1E3A8A] text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-gray-900 dark:text-white mb-2">Delete Form</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Are you sure you want to delete "<strong>{forms.find(f => f.id === deleteConfirm)?.name}</strong>"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteForm(deleteConfirm)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Delete Form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
