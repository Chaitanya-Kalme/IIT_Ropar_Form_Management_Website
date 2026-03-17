'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { assignedForms } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { FileText, Download, ChevronRight, BarChart2, CheckCircle, Clock, XCircle, FileStack } from 'lucide-react';

export default function AssignedFormsPage() {
  const router = useRouter();

  const handleExportCSV = () => {
    const csv = ['Form Name,Type,Total,Pending,Accepted,Rejected,Status,Deadline',
      ...assignedForms.map(f => `${f.formName},${f.formType},${f.totalSubmissions},${f.pending},${f.accepted},${f.rejected},${f.status},${f.deadline}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'assigned-forms.csv'; a.click();
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>All Assigned Forms</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Forms assigned to you for verification</p>
        </div>
        <div className="export-group">
          <button onClick={handleExportCSV} className="btn-outline">
            <Download className="w-4 h-4 text-green-500" /> Export CSV
          </button>
          <button className="btn-outline">
            <Download className="w-4 h-4 text-red-400" /> Export PDF
          </button>
        </div>
      </div>

      {/* Form Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {assignedForms.map(form => (
          <div key={form.id}
            className="stat-card group cursor-pointer"
            onClick={() => router.push(`/assigned-forms/${form.id}`)}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)' }}>
                  <FileText className="w-5 h-5" style={{ color: '#3B82F6' }} />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{form.formName}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{form.formType}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className={`badge ${form.status === 'Active' ? 'badge-accepted' : 'badge-expired'}`}>
                  {form.status}
                </span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { label: 'Total', val: form.totalSubmissions, color: '#3B82F6', icon: FileStack },
                { label: 'Accepted', val: form.accepted, color: '#22C55E', icon: CheckCircle },
                { label: 'Pending', val: form.pending, color: '#F59E0B', icon: Clock },
                { label: 'Rejected', val: form.rejected, color: '#EF4444', icon: XCircle },
              ].map(({ label, val, color, icon: Icon }) => (
                <div key={label} className="text-center">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1"
                    style={{ background: `${color}18` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                  <div className="text-lg font-bold" style={{ color }}>{val}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                <span>Completion</span>
                <span>{Math.round((form.accepted / form.totalSubmissions) * 100)}%</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${Math.round((form.accepted / form.totalSubmissions) * 100)}%`, background: 'linear-gradient(90deg,#22C55E,#14B8A6)' }} />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Deadline: <strong style={{ color: 'var(--text)' }}>{new Date(form.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</strong>
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#3B82F6' }}>
                Open Dashboard <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Bottom accent */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'linear-gradient(90deg,#3B82F6,#14B8A6)' }} />
          </div>
        ))}
      </div>

      {/* Table view */}
      <div className="content-card">
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h3 className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <BarChart2 className="w-4.5 h-4.5" style={{ color: '#3B82F6', width: 18, height: 18 }} />
            Forms Summary Table
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Form Name</th>
                <th>Type</th>
                <th>Total Submissions</th>
                <th>Status</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignedForms.map(f => (
                <tr key={f.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#EFF6FF' }}>
                        <FileText className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{f.formName}</span>
                    </div>
                  </td>
                  <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{f.formType}</td>
                  <td>
                    <span className="font-bold" style={{ color: '#3B82F6' }}>{f.totalSubmissions}</span>
                  </td>
                  <td>
                    <span className={`badge ${f.status === 'Active' ? 'badge-accepted' : 'badge-expired'}`}>{f.status}</span>
                  </td>
                  <td className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {new Date(f.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => router.push(`/assigned-forms/${f.id}`)}
                        className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }}>
                        <BarChart2 className="w-3.5 h-3.5" /> View Dashboard
                      </button>
                    </div>
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
