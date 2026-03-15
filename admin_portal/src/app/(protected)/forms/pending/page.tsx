'use client';

import React, { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, Eye, Clock, User, FileText, ChevronRight, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { mockSubmissions } from '@/data/mockData';

interface Submission {
  id: string;
  user: string;
  formName: string;
  dateSubmitted: string;
  status: string;
  verifierLevel: string;
  currentVerifier: string;
}

interface DetailPanelProps {
  submission: Submission;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

function DetailPanel({ submission, onClose, onApprove, onReject }: DetailPanelProps) {
  const timeline = [
    { level: 'Caretaker', status: 'verified', date: '2025-02-19', name: 'Mr. Rajesh Verma', comment: 'Verified and approved.' },
    { level: 'HOD', status: submission.currentVerifier === 'HOD' ? 'pending' : 'verified', date: submission.currentVerifier === 'HOD' ? '' : '2025-02-20', name: 'Dr. Suresh Kumar', comment: '' },
    { level: 'Dean', status: 'pending', date: '', name: 'Prof. Anita Singh', comment: '' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4" style={{ backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.3)' }}
      onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 w-full max-w-lg h-full max-h-screen overflow-y-auto rounded-2xl shadow-2xl p-6 space-y-6"
        onClick={e => e.stopPropagation()}
        style={{ marginTop: '0' }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-gray-900 dark:text-white">Form Details</h3>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* User Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <p className="text-xs font-semibold text-[#1E3A8A] dark:text-blue-300 uppercase tracking-wide mb-3">User Information</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1E3A8A] text-white font-semibold text-sm flex items-center justify-center">
              {submission.user.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{submission.user}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">{submission.user.toLowerCase().replace(' ', '.')}@iitrpr.ac.in</p>
            </div>
          </div>
        </div>

        {/* Submitted Data */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Submitted Data</p>
          <div className="space-y-3">
            {[
              { label: 'Form Name', value: submission.formName },
              { label: 'Date Submitted', value: submission.dateSubmitted },
              { label: 'Form ID', value: `IITRPR-2025-${submission.id.toUpperCase()}` },
              { label: 'Department', value: 'Computer Science & Engineering' },
              { label: 'Purpose', value: 'Academic requirement — semester break' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-start py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
                <span className="text-xs font-medium text-gray-800 dark:text-white text-right max-w-xs">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Uploaded Documents</p>
          <div className="space-y-2">
            {['ID_Proof.pdf', 'Supporting_Document.pdf'].map(doc => (
              <div key={doc} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-[#1E3A8A]" />
                  <span className="text-xs text-gray-700 dark:text-gray-300">{doc}</span>
                </div>
                <button className="text-xs text-[#3B82F6] hover:underline cursor-pointer">View</button>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Timeline */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Verification Timeline</p>
          <div className="relative">
            {timeline.map((step, i) => (
              <div key={step.level} className="flex gap-4 mb-6 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 flex-shrink-0 ${
                    step.status === 'verified' ? 'bg-green-100 dark:bg-green-900/30' :
                    step.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30' :
                    'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    {step.status === 'verified' ? (
                      <Check size={14} className="text-green-600" />
                    ) : (
                      <Clock size={14} className="text-amber-500" />
                    )}
                  </div>
                  {i < timeline.length - 1 && (
                    <div className={`w-0.5 h-10 mt-1 ${step.status === 'verified' ? 'bg-green-200 dark:bg-green-700' : 'bg-gray-200 dark:bg-gray-700'}`} />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{step.level}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      step.status === 'verified' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    }`}>
                      {step.status === 'verified' ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{step.name}</p>
                  {step.date && <p className="text-xs text-gray-400 dark:text-gray-500">{step.date}</p>}
                  {step.comment && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">"{step.comment}"</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {submission.status === 'Pending' && (
          <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => { onApprove(submission.id); onClose(); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors "
            >
              <CheckCircle size={16} /> Approve
            </button>
            <button
              onClick={() => { onReject(submission.id); onClose(); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors "
            >
              <XCircle size={16} /> Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PendingApprovalsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>(
    mockSubmissions.filter(s => s.status === 'Pending')
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [viewDetail, setViewDetail] = useState<Submission | null>(null);
  const [rejectModal, setRejectModal] = useState<string | 'bulk' | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const filtered = submissions.filter(s =>
    s.user.toLowerCase().includes(search.toLowerCase()) ||
    s.formName.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(s => s.id)));
  };

  const approveSelected = () => {
    setSubmissions(prev => prev.filter(s => !selected.has(s.id)));
    toast.success(`${selected.size} form(s) approved successfully`);
    setSelected(new Set());
  };

  const approveOne = (id: string) => {
    setSubmissions(prev => prev.filter(s => s.id !== id));
    toast.success('Form approved successfully');
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) { toast.error('Please provide a reason for rejection'); return; }
    if (rejectModal === 'bulk') {
      setSubmissions(prev => prev.filter(s => !selected.has(s.id)));
      toast.error(`${selected.size} form(s) rejected`);
      setSelected(new Set());
    } else if (rejectModal) {
      setSubmissions(prev => prev.filter(s => s.id !== rejectModal));
      toast.error('Form rejected');
    }
    setRejectModal(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div>
        <h1 className="text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Pending Approvals</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{submissions.length} submissions awaiting review</p>
      </div>

      {/* Bulk Action Bar */}
      {selected.size > 0 && (
        <div className="bg-[#1E3A8A] text-white rounded-xl px-5 py-3 flex items-center justify-between">
          <p className="text-sm font-medium">{selected.size} submission(s) selected</p>
          <div className="flex items-center gap-3">
            <button
              onClick={approveSelected}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <CheckCircle size={14} /> Approve Selected
            </button>
            <button
              onClick={() => setRejectModal('bulk')}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <XCircle size={14} /> Reject Selected
            </button>
            <button onClick={() => setSelected(new Set())} className="p-1 hover:bg-white/20 rounded transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800"
        style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user or form..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 dark:text-white"
          />
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
                {['Submitting User', 'Form Name', 'Date Submitted', 'Current Verifier', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => (
                <tr key={sub.id} className={`border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors ${selected.has(sub.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                  <td className="px-6 py-4 w-12">
                    <input
                      type="checkbox"
                      checked={selected.has(sub.id)}
                      onChange={() => toggleSelect(sub.id)}
                      className="w-4 h-4 text-[#1E3A8A] rounded border-gray-300 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center justify-center">
                        {sub.user.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{sub.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{sub.formName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{sub.dateSubmitted}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full font-medium w-fit">
                      <Clock size={11} /> {sub.currentVerifier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewDetail(sub)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#1E3A8A] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors font-medium"
                      >
                        <Eye size={12} /> View
                      </button>
                      <button
                        onClick={() => approveOne(sub.id)}
                        className="p-1.5 text-green-600 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <CheckCircle size={14} />
                      </button>
                      <button
                        onClick={() => setRejectModal(sub.id)}
                        className="p-1.5 text-red-500 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <CheckCircle size={32} className="text-green-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No pending approvals</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">All submissions have been reviewed</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {viewDetail && (
        <DetailPanel
          submission={viewDetail}
          onClose={() => setViewDetail(null)}
          onApprove={approveOne}
          onReject={(id) => setRejectModal(id)}
        />
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-4">
              <XCircle size={22} className="text-red-500" />
            </div>
            <h3 className="text-gray-900 dark:text-white mb-1">Reject Submission{rejectModal === 'bulk' ? 's' : ''}</h3>
            {rejectModal === 'bulk' && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">This reason will be applied to all {selected.size} selected submission(s).</p>
            )}
            <div className="mt-4 mb-5">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Reason for Rejection *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Provide a clear reason for rejection..."
                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-300 bg-gray-50 dark:bg-gray-800 dark:text-white resize-none h-24"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
