'use client';
import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { submissions, assignedForms } from '@/lib/data';
import Link from 'next/link';
import { Search, Filter, CheckCircle, XCircle, CornerDownLeft, Eye, Download, ChevronDown, X } from 'lucide-react';

const FORM_TYPES = ['All', 'Certificate', 'Leave', 'Scholarship', 'Hostel', 'Research', 'Finance', 'Academic'];
const DEPARTMENTS = ['All', 'CSE', 'EE', 'ME', 'CH', 'PH'];
const DEADLINE_OPTIONS = ['All', 'Today', 'Tomorrow', 'This Week', 'Expired'];

function RejectModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (r: string) => void }) {
  const [reason, setReason] = useState('');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>Reject Form</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Please provide a reason for rejection. This will be shared with the student.</p>
        <textarea value={reason} onChange={e => setReason(e.target.value)} rows={4} placeholder="Enter rejection reason..."
          className="form-input resize-none mb-4" />
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={() => reason.trim() && onSubmit(reason)} className="btn-danger"
            style={{ opacity: reason.trim() ? 1 : 0.5, cursor: reason.trim() ? 'pointer' : 'not-allowed' }}>
            <XCircle className="w-4 h-4" /> Confirm Reject
          </button>
        </div>
      </div>
    </div>
  );
}

function SendBackModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (r: string) => void }) {
  const [reason, setReason] = useState('');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>Send Back to Student</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Specify what corrections the student needs to make.</p>
        <textarea value={reason} onChange={e => setReason(e.target.value)} rows={4} placeholder="Describe the required corrections..."
          className="form-input resize-none mb-4" />
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={() => reason.trim() && onSubmit(reason)} className="btn-warning"
            style={{ opacity: reason.trim() ? 1 : 0.5, cursor: reason.trim() ? 'pointer' : 'not-allowed' }}>
            <CornerDownLeft className="w-4 h-4" /> Send Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PendingApprovalsPage() {
  const [search, setSearch] = useState('');
  const [formType, setFormType] = useState('All');
  const [dept, setDept] = useState('All');
  const [deadlineFilter, setDeadlineFilter] = useState('All');
  const [selected, setSelected] = useState<string[]>([]);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [sendBackModal, setSendBackModal] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const pending = submissions.filter(s => s.status === 'Pending');

  const filtered = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 7);

    return pending.filter(s => {
      const matchSearch = !search || s.studentName.toLowerCase().includes(search.toLowerCase()) || s.formName.toLowerCase().includes(search.toLowerCase());
      const matchType = formType === 'All' || s.formType === formType;
      const matchDept = dept === 'All' || s.department === dept;
      const deadline = new Date(s.deadline); deadline.setHours(0, 0, 0, 0);
      const matchDeadline = deadlineFilter === 'All' ||
        (deadlineFilter === 'Today' && deadline.getTime() === today.getTime()) ||
        (deadlineFilter === 'Tomorrow' && deadline.getTime() === tomorrow.getTime()) ||
        (deadlineFilter === 'This Week' && deadline >= today && deadline <= weekEnd) ||
        (deadlineFilter === 'Expired' && deadline < today);
      return matchSearch && matchType && matchDept && matchDeadline;
    });
  }, [pending, search, formType, dept, deadlineFilter]);

  const allSelected = filtered.length > 0 && filtered.every(s => selected.includes(s.id));

  const toggleSelect = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleAll = () => setSelected(allSelected ? [] : filtered.map(s => s.id));

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleApprove = (id: string) => { showToast('Form approved successfully!'); };
  const handleReject = (reason: string) => { setRejectModal(null); showToast('Form rejected.'); };
  const handleSendBack = (reason: string) => { setSendBackModal(null); showToast('Form sent back to student.'); };
  const handleBulkApprove = () => { showToast(`${selected.length} form(s) approved!`); setSelected([]); };
  const handleBulkReject = () => { showToast(`${selected.length} form(s) rejected!`); setSelected([]); };

  const exportCSV = () => {
    const csv = ['Student,Form,Date,Verifier,Deadline', ...filtered.map(s => `${s.studentName},${s.formName},${s.submissionDate},${s.currentVerifier},${s.deadline}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'pending.csv'; a.click();
  };

  return (
    <DashboardLayout>
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-lg animate-slide-up"
          style={{ background: 'linear-gradient(135deg,#22C55E,#16a34a)' }}>
          ✓ {toast}
        </div>
      )}

      {rejectModal && <RejectModal onClose={() => setRejectModal(null)} onSubmit={handleReject} />}
      {sendBackModal && <SendBackModal onClose={() => setSendBackModal(null)} onSubmit={handleSendBack} />}

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Pending Approvals</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{filtered.length} forms awaiting your review</p>
        </div>
        <div className="export-group">
          <button onClick={exportCSV} className="btn-outline"><Download className="w-4 h-4 text-green-500" /> Export CSV</button>
          <button className="btn-outline"><Download className="w-4 h-4 text-red-400" /> Export PDF</button>
        </div>
      </div>

      {/* Filters */}
      <div className="content-card mb-5">
        <div className="p-4 flex flex-wrap gap-3 items-end">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student or form..."
              className="form-input pl-9" />
          </div>

          {/* Form Type */}
          <div className="relative min-w-36">
            <select value={formType} onChange={e => setFormType(e.target.value)} className="form-input appearance-none pr-8 cursor-pointer">
              {FORM_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          </div>

          {/* Department */}
          <div className="relative min-w-32">
            <select value={dept} onChange={e => setDept(e.target.value)} className="form-input appearance-none pr-8 cursor-pointer">
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          </div>

          {/* Deadline */}
          <div className="relative min-w-36">
            <select value={deadlineFilter} onChange={e => setDeadlineFilter(e.target.value)} className="form-input appearance-none pr-8 cursor-pointer">
              {DEADLINE_OPTIONS.map(d => <option key={d}>{d}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          </div>

          {/* Clear */}
          {(search || formType !== 'All' || dept !== 'All' || deadlineFilter !== 'All') && (
            <button onClick={() => { setSearch(''); setFormType('All'); setDept('All'); setDeadlineFilter('All'); }}
              className="btn-outline flex items-center gap-1.5">
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>

        {/* Bulk Actions */}
        {selected.length > 0 && (
          <div className="px-4 pb-4 flex items-center gap-3 animate-slide-up">
            <span className="text-sm font-semibold px-3 py-1.5 rounded-lg" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
              {selected.length} selected
            </span>
            <button onClick={handleBulkApprove} className="btn-success" style={{ padding: '7px 14px' }}>
              <CheckCircle className="w-4 h-4" /> Approve Selected
            </button>
            <button onClick={handleBulkReject} className="btn-danger" style={{ padding: '7px 14px' }}>
              <XCircle className="w-4 h-4" /> Reject Selected
            </button>
            <button onClick={() => setSelected([])} className="btn-outline" style={{ padding: '7px 14px' }}>
              <X className="w-4 h-4" /> Deselect
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="content-card">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}>
                  <input type="checkbox" checked={allSelected} onChange={toggleAll}
                    className="w-4 h-4 rounded accent-blue-500 cursor-pointer" />
                </th>
                <th>Student Name</th>
                <th>Form Name</th>
                <th>Submitted</th>
                <th>Current Verifier</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Filter className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
                      <p className="font-semibold" style={{ color: 'var(--text)' }}>No pending forms found</p>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(s => {
                const deadline = new Date(s.deadline);
                const today = new Date(); today.setHours(0, 0, 0, 0);
                const isOverdue = deadline < today;
                const isUrgent = !isOverdue && (deadline.getTime() - today.getTime()) < 86400000 * 2;

                return (
                  <tr key={s.id}>
                    <td>
                      <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggleSelect(s.id)}
                        className="w-4 h-4 rounded accent-blue-500 cursor-pointer" />
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: `hsl(${s.studentName.charCodeAt(0) * 7},60%,50%)` }}>
                          {s.studentName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{s.studentName}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.rollNo} · {s.department}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>{s.formName}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.formType}</p>
                    </td>
                    <td className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {new Date(s.submissionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="text-sm" style={{ color: 'var(--text)' }}>{s.currentVerifier}</td>
                    <td>
                      <span className={`badge ${isOverdue ? 'badge-rejected' : isUrgent ? 'badge-pending' : 'badge-accepted'}`}>
                        {isOverdue ? '⚠ Overdue' : new Date(s.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <Link href={`/form-details/${s.id}`} title="View Details"
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                          style={{ background: '#EFF6FF', color: '#3B82F6', textDecoration: 'none' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#DBEAFE'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#EFF6FF'}>
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => handleApprove(s.id)} title="Approve"
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                          style={{ background: '#F0FDF4', color: '#22C55E', border: 'none', cursor: 'pointer' }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#DCFCE7'}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#F0FDF4'}>
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setRejectModal(s.id)} title="Reject"
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                          style={{ background: '#FFF5F5', color: '#EF4444', border: 'none', cursor: 'pointer' }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#FEE2E2'}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#FFF5F5'}>
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setSendBackModal(s.id)} title="Send Back"
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                          style={{ background: '#FFFBEB', color: '#F59E0B', border: 'none', cursor: 'pointer' }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#FEF3C7'}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#FFFBEB'}>
                          <CornerDownLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
