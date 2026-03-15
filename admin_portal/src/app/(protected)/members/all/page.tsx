'use client';

import React, { useState } from 'react';
import { Search, Mail, Trash2, Edit2, UserPlus, X, Send, Check } from 'lucide-react';
import { toast } from 'sonner';
import { mockMembers } from '@/data/mockData';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  phone: string;
}

const roleColors: Record<string, string> = {
  Caretaker: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
  HOD: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  Dean: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  Faculty: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  Admin: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

interface EmailModalProps {
  recipients: Member[];
  onClose: () => void;
}

function EmailModal({ recipients, onClose }: EmailModalProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Subject and message body are required');
      return;
    }
    setSending(true);
    await new Promise(r => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
    toast.success(`Email sent to ${recipients.length} recipient(s)`);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(6px)', background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1E3A8A] rounded-lg flex items-center justify-center">
              <Mail size={15} className="text-white" />
            </div>
            <div>
              <h3 className="text-gray-900 dark:text-white text-sm">Compose Email</h3>
              <p className="text-gray-400 dark:text-gray-500 text-xs">{recipients.length} recipient(s)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Recipients */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">To</label>
            <div className="flex flex-wrap gap-1.5 p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl min-h-10">
              {recipients.map(r => (
                <span key={r.id} className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-[#1E3A8A] dark:text-blue-400 text-xs px-2.5 py-1 rounded-full">
                  {r.name}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Subject *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
              className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 bg-gray-50 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Message *</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type your message here..."
              className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 bg-gray-50 dark:bg-gray-800 dark:text-white resize-none h-32"
            />
          </div>
        </div>

        <div className="flex gap-3 p-5 pt-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || sent}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-white text-sm font-semibold rounded-xl transition-all ${
              sent ? 'bg-green-500' : 'bg-[#1E3A8A] hover:bg-[#1e3a8a]/90 disabled:opacity-60'
            }`}
          >
            {sent ? (
              <><Check size={14} /> Sent!</>
            ) : sending ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
            ) : (
              <><Send size={14} /> Send Email</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AllMembersPage() {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [emailRecipients, setEmailRecipients] = useState<Member[] | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || m.role === roleFilter;
    return matchSearch && matchRole;
  });

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(m => m.id)));
  };

  const handleBulkEmail = () => {
    const recipients = members.filter(m => selected.has(m.id));
    setEmailRecipients(recipients);
  };

  const handleSingleEmail = (member: Member) => {
    setEmailRecipients([member]);
  };

  const deleteMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    toast.success('Member removed successfully');
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>All Members</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{members.length} staff members</p>
        </div>
        <button
          onClick={() => toast.info('Navigate to Add Member')}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1E3A8A] text-white text-sm font-semibold rounded-xl hover:bg-[#1e3a8a]/90 transition-all shadow-lg shadow-blue-900/20"
        >
          <UserPlus size={16} /> Add Member
        </button>
      </div>

      {/* Bulk Action Bar */}
      {selected.size > 0 && (
        <div className="bg-[#1E3A8A] text-white rounded-xl px-5 py-3 flex items-center justify-between">
          <p className="text-sm font-medium">{selected.size} member(s) selected</p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkEmail}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Mail size={13} /> Send Email to Selected
            </button>
            <button onClick={() => setSelected(new Set())} className="p-1 hover:bg-white/20 rounded transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 flex flex-wrap gap-3 items-center"
        style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['All', 'Caretaker', 'HOD', 'Dean', 'Faculty', 'Admin'].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                roleFilter === r
                  ? 'bg-[#1E3A8A] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {r}
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
                <th className="px-6 py-3.5 w-12">
                  <input
                    type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="w-4 h-4 text-[#1E3A8A] rounded border-gray-300 cursor-pointer"
                  />
                </th>
                {['Name', 'Email', 'Role', 'Department', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => (
                <tr key={member.id} className={`border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors ${selected.has(member.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                  <td className="px-6 py-4 w-12">
                    <input
                      type="checkbox"
                      checked={selected.has(member.id)}
                      onChange={() => toggleSelect(member.id)}
                      className="w-4 h-4 text-[#1E3A8A] rounded border-gray-300 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full text-white text-sm font-semibold flex items-center justify-center flex-shrink-0"
                        style={{ background: `hsl(${member.name.charCodeAt(0) * 13 % 360}, 55%, 35%)` }}
                      >
                        {member.name.split(' ').slice(-2).map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{member.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{member.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{member.email}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleColors[member.role] || 'bg-gray-100 text-gray-600'}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-48 truncate">{member.department}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSingleEmail(member)}
                        className="p-1.5 text-[#1E3A8A] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 rounded-lg transition-colors"
                        title={`Email ${member.name}`}
                      >
                        <Mail size={14} />
                      </button>
                      <button
                        onClick={() => toast.info(`Edit ${member.name}`)}
                        className="p-1.5 text-gray-500 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(member.id)}
                        className="p-1.5 text-red-500 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No members found matching your search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing <span className="font-medium">{filtered.length}</span> of <span className="font-medium">{members.length}</span> members
          </p>
        </div>
      </div>

      {/* Email Modal */}
      {emailRecipients && (
        <EmailModal recipients={emailRecipients} onClose={() => setEmailRecipients(null)} />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-gray-900 dark:text-white mb-2">Remove Member</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Are you sure you want to remove <strong>{members.find(m => m.id === deleteConfirm)?.name}</strong> from the system?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMember(deleteConfirm)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
