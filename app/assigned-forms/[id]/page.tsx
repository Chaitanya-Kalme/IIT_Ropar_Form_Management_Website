'use client';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { assignedForms, submissions } from '@/lib/data';
import Link from 'next/link';
import { CheckCircle, XCircle, Clock, FileStack, AlertTriangle, Eye, Download, ArrowRight } from 'lucide-react';

export default function FormDashboardPage() {
  const { id } = useParams<{ id: string }>();
  const form = assignedForms.find(f => f.id === id) || assignedForms[0];
  const filtered = submissions.filter(s => s.formName === form.formName);

  const stats = [
    { label: 'Total', value: form.totalSubmissions, icon: FileStack, color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Accepted', value: form.accepted, icon: CheckCircle, color: '#22C55E', bg: '#F0FDF4' },
    { label: 'Pending', value: form.pending, icon: Clock, color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Rejected', value: form.rejected, icon: XCircle, color: '#EF4444', bg: '#FFF5F5' },
    { label: 'Expired', value: form.expired, icon: AlertTriangle, color: '#94A3B8', bg: '#F8FAFC' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/assigned-forms" className="text-sm" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Assigned Forms</Link>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{form.formName}</span>
          </div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{form.formName}</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Dashboard for {form.formType} · Deadline: {new Date(form.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
        </div>
        <div className="export-group">
          <button className="btn-outline"><Download className="w-4 h-4 text-green-500" /> Export CSV</button>
          <button className="btn-outline"><Download className="w-4 h-4 text-red-400" /> Export PDF</button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card cursor-default"
            onClick={() => label !== 'Total' ? window.location.href = `/all-submissions?form=${encodeURIComponent(form.formName)}&status=${label}` : null}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>{value}</div>
            <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Submissions Table */}
      <div className="content-card">
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h3 className="font-bold text-base" style={{ color: 'var(--text)' }}>Submissions for this Form</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Filtered by: {form.formName}</p>
          </div>
          <Link href={`/all-submissions?form=${encodeURIComponent(form.formName)}`}
            className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#3B82F6', textDecoration: 'none' }}>
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Submission Date</th>
                <th>Status</th>
                <th>Current Verifier</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No submissions found for this form.</td></tr>
              ) : filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: `hsl(${s.studentName.charCodeAt(0) * 7},60%,50%)` }}>
                        {s.studentName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{s.studentName}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.rollNo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{new Date(s.submissionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td><span className={`badge badge-${s.status.toLowerCase()}`}>{s.status}</span></td>
                  <td className="text-sm" style={{ color: 'var(--text)' }}>{s.currentVerifier}</td>
                  <td>
                    <Link href={`/form-details/${s.id}`}
                      className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#3B82F6', textDecoration: 'none' }}>
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
