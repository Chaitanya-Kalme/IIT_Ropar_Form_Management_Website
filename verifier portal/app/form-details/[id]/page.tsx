'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getFormDetails } from '@/lib/data';
import Link from 'next/link';
import {
  CheckCircle, XCircle, CornerDownLeft, Download, FileText, Image as ImageIcon,
  ChevronLeft, User, Mail, Hash, Building, Calendar, Clock, Send, ArrowRight,
  Shield, Check, AlertCircle
} from 'lucide-react';

function RejectModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (r: string) => void }) {
  const [reason, setReason] = useState('');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FEE2E2' }}>
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Reject this Form</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>The student will be notified with your reason.</p>
          </div>
        </div>
        <textarea value={reason} onChange={e => setReason(e.target.value)} rows={4}
          placeholder="Enter rejection reason (required)..."
          className="form-input resize-none mb-4" />
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={() => reason.trim() && onSubmit(reason)} className="btn-danger"
            style={{ opacity: reason.trim() ? 1 : 0.5 }}>
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
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FFFBEB' }}>
            <CornerDownLeft className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Send Back for Correction</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>The form will be returned to the student for corrections.</p>
          </div>
        </div>
        <textarea value={reason} onChange={e => setReason(e.target.value)} rows={4}
          placeholder="Describe required corrections (required)..."
          className="form-input resize-none mb-4" />
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={() => reason.trim() && onSubmit(reason)} className="btn-warning"
            style={{ opacity: reason.trim() ? 1 : 0.5 }}>
            <CornerDownLeft className="w-4 h-4" /> Send Back
          </button>
        </div>
      </div>
    </div>
  );
}

const stageColors: Record<string, { bg: string; border: string; icon: string; text: string }> = {
  Completed: { bg: '#F0FDF4', border: '#22C55E', icon: '#22C55E', text: '#065F46' },
  Current: { bg: '#EFF6FF', border: '#3B82F6', icon: '#3B82F6', text: '#1D4ED8' },
  Pending: { bg: 'var(--bg)', border: 'var(--border)', icon: '#94A3B8', text: 'var(--text-muted)' },
};

export default function FormDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const details = getFormDetails(id);
  const [rejectModal, setRejectModal] = useState(false);
  const [sendBackModal, setSendBackModal] = useState(false);
  const [toast, setToast] = useState('');
  const [approved, setApproved] = useState(false);

  const isLastVerifier = details.currentLevel === details.totalLevels;
  const workflow = details.workflow;
  const nextVerifier = workflow.find(w => w.status === 'Pending');

  const showToast = (msg: string, color = '#22C55E') => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleApprove = () => {
    setApproved(true);
    showToast('Form approved successfully! Student will be notified.');
  };

  const handleSendToNext = () => {
    if (nextVerifier) showToast(`Form forwarded to ${nextVerifier.verifierName} (${nextVerifier.role}).`);
  };

  return (
    <DashboardLayout>
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-lg animate-slide-up"
          style={{ background: 'linear-gradient(135deg,#22C55E,#16a34a)' }}>
          ✓ {toast}
        </div>
      )}
      {rejectModal && <RejectModal onClose={() => setRejectModal(false)} onSubmit={r => { setRejectModal(false); showToast('Form rejected. Student has been notified.'); }} />}
      {sendBackModal && <SendBackModal onClose={() => setSendBackModal(false)} onSubmit={r => { setSendBackModal(false); showToast('Form sent back for correction.'); }} />}

      {/* Back nav */}
      <div className="mb-5 flex items-center gap-2">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <span style={{ color: 'var(--text-muted)' }}>/</span>
        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Form Details</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{details.formName}</h2>
          <p className="text-sm mt-1 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <span>{details.studentName}</span>
            <span>·</span>
            <span>{details.rollNo}</span>
            <span>·</span>
            <span>{details.department}</span>
            <span>·</span>
            <span className={`badge badge-${details.status.toLowerCase()}`}>{details.status}</span>
          </p>
        </div>
        {!approved && (
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setSendBackModal(true)} className="btn-warning">
              <CornerDownLeft className="w-4 h-4" /> Send Back
            </button>
            <button onClick={() => setRejectModal(true)} className="btn-danger">
              <XCircle className="w-4 h-4" /> Reject
            </button>
            {isLastVerifier ? (
              <button onClick={handleApprove} className="btn-success">
                <CheckCircle className="w-4 h-4" /> Final Approve
              </button>
            ) : (
              <button onClick={handleSendToNext} className="btn-primary">
                <Send className="w-4 h-4" />
                Send to {nextVerifier?.verifierName || 'Next Verifier'}
              </button>
            )}
          </div>
        )}
        {approved && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm"
            style={{ background: '#F0FDF4', color: '#22C55E', border: '1px solid #86EFAC' }}>
            <CheckCircle className="w-4 h-4" /> Approved
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left: Verification Workflow + Form Fields + Docs */}
        <div className="xl:col-span-2 space-y-5">

          {/* Verification Timeline */}
          <div className="content-card p-6">
            <h3 className="font-bold text-base mb-6 flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <Shield className="w-4.5 h-4.5 text-blue-500" style={{ width: 18, height: 18 }} />
              Verification Workflow
            </h3>
            <div className="space-y-0">
              {workflow.map((stage, i) => {
                const c = stageColors[stage.status];
                const isLast = i === workflow.length - 1;
                return (
                  <div key={stage.level} className="flex gap-4">
                    {/* Icon + connector */}
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                        style={{ background: c.bg, border: `2px solid ${c.border}` }}>
                        {stage.status === 'Completed'
                          ? <Check className="w-4 h-4" style={{ color: c.icon }} />
                          : stage.status === 'Current'
                          ? <Clock className="w-4 h-4" style={{ color: c.icon }} />
                          : <AlertCircle className="w-4 h-4" style={{ color: c.icon }} />}
                      </div>
                      {!isLast && (
                        <div className={`step-connector ${stage.status === 'Completed' ? 'done' : 'pending'}`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className={`pb-6 flex-1 ${isLast ? 'pb-0' : ''}`}>
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>Level {stage.level}: {stage.role}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                              style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}40` }}>
                              {stage.status}
                            </span>
                          </div>
                          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            <User className="w-3 h-3 inline mr-1" />{stage.verifierName}
                          </p>
                        </div>
                        {stage.date && (
                          <div className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                            <Calendar className="w-3 h-3" />
                            {new Date(stage.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        )}
                      </div>
                      {stage.comment && (
                        <div className="mt-2 px-3 py-2 rounded-xl text-sm italic"
                          style={{ background: '#F0FDF4', color: '#065F46', borderLeft: '3px solid #22C55E' }}>
                          "{stage.comment}"
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Fields */}
          <div className="content-card p-6">
            <h3 className="font-bold text-base mb-5 flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <FileText className="w-4.5 h-4.5 text-purple-500" style={{ width: 18, height: 18 }} />
              Submitted Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {details.fields.map(field => (
                <div key={field.label} className="rounded-xl p-4 transition-colors"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>{field.label}</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{field.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="content-card p-6">
            <h3 className="font-bold text-base mb-5 flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <Download className="w-4.5 h-4.5 text-teal-500" style={{ width: 18, height: 18 }} />
              Uploaded Documents
            </h3>
            <div className="space-y-3">
              {details.documents.map(doc => (
                <div key={doc.name} className="flex items-center justify-between p-4 rounded-xl transition-all cursor-pointer group"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#3B82F6'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: doc.type === 'pdf' ? '#FFF5F5' : '#EFF6FF' }}>
                      {doc.type === 'pdf'
                        ? <FileText className="w-5 h-5 text-red-400" />
                        : <ImageIcon className="w-5 h-5 text-blue-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{doc.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{doc.type.toUpperCase()} · {doc.size}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{ background: '#EFF6FF', color: '#3B82F6', border: 'none', cursor: 'pointer' }}>
                      Preview
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* PDF Preview Placeholder */}
            <div className="mt-4 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <div className="px-4 py-2 flex items-center gap-2 border-b" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>Identity Proof.pdf — Preview</span>
              </div>
              <div className="h-40 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <div className="text-center">
                  <FileText className="w-10 h-10 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>PDF Preview Area</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>In production, embeds the actual document</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Summary + Action Panel */}
        <div className="space-y-5">
          {/* Student Summary Card */}
          <div className="content-card p-5">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold mb-3"
                style={{ background: `hsl(${details.studentName.charCodeAt(0) * 7},60%,50%)` }}>
                {details.studentName.split(' ').map(n => n[0]).join('')}
              </div>
              <p className="font-bold" style={{ color: 'var(--text)' }}>{details.studentName}</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{details.rollNo}</p>
              <span className={`badge badge-${details.status.toLowerCase()} mt-2`}>{details.status}</span>
            </div>
            <div className="space-y-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              {[
                { icon: Building, label: 'Department', val: details.department },
                { icon: Hash, label: 'Form Type', val: details.formType },
                { icon: Calendar, label: 'Submitted', val: new Date(details.submissionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
                { icon: Clock, label: 'Deadline', val: new Date(details.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--bg)' }}>
                    <Icon className="w-4 h-4" style={{ color: '#3B82F6' }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Card */}
          <div className="content-card p-5">
            <h4 className="font-bold text-sm mb-4" style={{ color: 'var(--text)' }}>Verification Progress</h4>
            <div className="flex items-center justify-between mb-2 text-sm">
              <span style={{ color: 'var(--text-muted)' }}>Level {details.currentLevel} of {details.totalLevels}</span>
              <span className="font-bold" style={{ color: '#3B82F6' }}>{Math.round((details.currentLevel / details.totalLevels) * 100)}%</span>
            </div>
            <div className="h-2 rounded-full mb-4" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${(details.currentLevel / details.totalLevels) * 100}%`, background: 'linear-gradient(90deg,#3B82F6,#14B8A6)' }} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {workflow.map(s => (
                <div key={s.level} className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{
                    background: s.status === 'Completed' ? '#F0FDF4' : s.status === 'Current' ? '#EFF6FF' : 'var(--bg)',
                    color: s.status === 'Completed' ? '#22C55E' : s.status === 'Current' ? '#3B82F6' : 'var(--text-muted)',
                    border: `1px solid ${s.status === 'Completed' ? '#22C55E40' : s.status === 'Current' ? '#3B82F640' : 'var(--border)'}`,
                  }}>
                  {s.level}
                </div>
              ))}
            </div>
          </div>

          {/* Action Panel */}
          {!approved && (
            <div className="content-card p-5">
              <h4 className="font-bold text-sm mb-4" style={{ color: 'var(--text)' }}>Your Actions</h4>
              <div className="space-y-2.5">
                {isLastVerifier ? (
                  <button onClick={handleApprove} className="btn-success w-full justify-center" style={{ width: '100%' }}>
                    <CheckCircle className="w-4 h-4" /> Final Approve
                  </button>
                ) : (
                  <button onClick={handleSendToNext} className="btn-primary w-full justify-center" style={{ width: '100%' }}>
                    <ArrowRight className="w-4 h-4" />
                    Forward to {nextVerifier?.role || 'Next Level'}
                  </button>
                )}
                <button onClick={() => setSendBackModal(true)} className="btn-warning w-full justify-center" style={{ width: '100%' }}>
                  <CornerDownLeft className="w-4 h-4" /> Send Back for Correction
                </button>
                <button onClick={() => setRejectModal(true)} className="btn-danger w-full justify-center" style={{ width: '100%' }}>
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
