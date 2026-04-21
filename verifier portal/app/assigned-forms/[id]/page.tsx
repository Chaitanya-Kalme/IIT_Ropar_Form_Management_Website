'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import {
  CheckCircle,
  XCircle,
  Clock,
  FileStack,
  AlertTriangle,
  Eye,
  Download,
  ArrowRight,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type SubmissionStatus = 'Accepted' | 'Pending' | 'Rejected' | 'Expired';

interface Submission {
  id: string;
  studentName: string;
  email: string;
  submissionDate: string;
  status: SubmissionStatus;
  currentLevel: number;
  currentVerifier: string;
  overallStatus: string;
}

interface FormMeta {
  id: number;
  title: string;
  description: string;
  deadline: string;
  formStatus: boolean;
  isExpired: boolean;
}

interface Stats {
  total: number;
  accepted: number;
  pending: number;
  rejected: number;
  expired: number;
}

interface DashboardData {
  form: FormMeta;
  stats: Stats;
  submissions: Submission[];
}

const PAGE_SIZE = 10;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FormDashboardPage() {
  const { id } = useParams<{ id: string }>();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!id) return;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/verifier/getFormDetails/${id}`);

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to fetch dashboard data');
        }

        const json: DashboardData = await res.json();
        setData(json);
        setCurrentPage(1);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [id]);

  // ── Export CSV ────────────────────────────────────────────────────────────
  const exportCSV = () => {
    if (!data) return;
    const csv = [
      'Student,Email,Submitted,Status,Current Verifier,Level',
      ...data.submissions.map(s =>
        `"${s.studentName}","${s.email}",` +
        `"${new Date(s.submissionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}",` +
        `"${s.status}","${s.currentVerifier}","L${s.currentLevel}"`
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.form.title.replace(/\s+/g, '_')}_submissions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Export PDF ────────────────────────────────────────────────────────────
  const exportPDF = () => {
    if (!data) return;
    const { form, submissions } = data;

    const rows = submissions.map(s => `
      <tr>
        <td>
          <strong>${s.studentName}</strong><br/>
          <span class="sub">${s.email}</span>
        </td>
        <td>${new Date(s.submissionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
        <td><span class="badge ${s.status.toLowerCase()}">${s.status}</span></td>
        <td>${s.currentVerifier}</td>
        <td>L${s.currentLevel}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${form.title} — Submissions</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #1e293b; padding: 28px; }
    .header { margin-bottom: 6px; }
    h1 { font-size: 18px; font-weight: 700; }
    .desc { color: #64748b; font-size: 11px; margin-top: 3px; }
    .meta { display: flex; gap: 16px; margin: 12px 0 20px; font-size: 11px; color: #64748b; }
    .meta span { background: #f1f5f9; padding: 3px 10px; border-radius: 99px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f1f5f9; text-align: left; padding: 8px 10px; font-size: 11px;
         text-transform: uppercase; letter-spacing: .5px; color: #475569;
         border-bottom: 2px solid #e2e8f0; }
    td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    .sub { color: #94a3b8; font-size: 11px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; }
    .badge.accepted { background: #dcfce7; color: #16a34a; }
    .badge.pending  { background: #fef9c3; color: #b45309; }
    .badge.rejected { background: #fee2e2; color: #dc2626; }
    .badge.expired  { background: #f1f5f9; color: #64748b; }
    .footer { margin-top: 20px; font-size: 11px; color: #94a3b8; text-align: right; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${form.title}</h1>
    <p class="desc">${form.description}</p>
  </div>
  <div class="meta">
    <span>Deadline: ${new Date(form.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}${form.isExpired ? ' (Expired)' : ''}</span>
    <span>Total: ${submissions.length} submissions</span>
    <span>Exported: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
  </div>
  <table>
    <thead>
      <tr>
        <th>Student</th>
        <th>Submitted</th>
        <th>Status</th>
        <th>Current Verifier</th>
        <th>Level</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="footer">Generated from the Verifier Dashboard</p>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--text-muted)' }} />
          <span className="ml-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Loading dashboard...
          </span>
        </div>
      </DashboardLayout>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <AlertTriangle className="w-8 h-8 text-red-400" />
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
            {error ?? 'No data found'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-outline text-sm"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const { form, stats, submissions } = data;

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(submissions.length / PAGE_SIZE);
  const paginated = submissions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage, '...', totalPages);
    }
    return pages;
  };

  // ── Stat card config ───────────────────────────────────────────────────────
  const statCards = [
    { label: 'Total', value: stats.total, icon: FileStack, color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Accepted', value: stats.accepted, icon: CheckCircle, color: '#22C55E', bg: '#F0FDF4' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: '#EF4444', bg: '#FFF5F5' },
    { label: 'Expired', value: stats.expired, icon: AlertTriangle, color: '#94A3B8', bg: '#F8FAFC' },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/assigned-forms"
              className="text-sm"
              style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
            >
              Assigned Forms
            </Link>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              {form.title}
            </span>
          </div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            {form.title}
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {form.description} · Deadline:{' '}
            {new Date(form.deadline).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
            {form.isExpired && (
              <span className="ml-2 text-xs font-semibold text-red-400">(Expired)</span>
            )}
          </p>
        </div>

        <div className="export-group">
          <button onClick={exportCSV} className="btn-outline">
            <Download className="w-4 h-4 text-green-500" /> Export CSV
          </button>
          <button onClick={exportPDF} className="btn-outline">
            <Download className="w-4 h-4 text-red-400" /> Export PDF
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="stat-card cursor-default"
            onClick={() =>
              label !== 'Total'
                ? (window.location.href = `/all-submissions?formId=${form.id}&status=${label}`)
                : null
            }
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: bg }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>
              {value}
            </div>
            <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Submissions Table */}
      <div className="content-card">
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div>
            <h3 className="font-bold text-base" style={{ color: 'var(--text)' }}>
              Submissions for this Form
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {submissions.length} total · showing page {currentPage} of {totalPages || 1}
            </p>
          </div>
          <Link
            href={`/all-submissions?formId=${form.id}`}
            className="flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: '#3B82F6', textDecoration: 'none' }}
          >
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
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-8"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    No submissions found for this form.
                  </td>
                </tr>
              ) : (
                paginated.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: `hsl(${s.studentName.charCodeAt(0) * 7},60%,50%)` }}
                        >
                          {s.studentName.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                            {s.studentName}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {s.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {new Date(s.submissionDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td>
                      <span className={`badge badge-${s.status.toLowerCase()}`}>
                        {s.status}
                      </span>
                    </td>

                    <td className="text-sm" style={{ color: 'var(--text)' }}>
                      {s.currentVerifier}
                    </td>

                    <td>
                      <Link
                        href={`/form-details/${s.id}`}
                        className="flex items-center gap-1.5 text-sm font-semibold"
                        style={{ color: '#3B82F6', textDecoration: 'none' }}
                      >
                        <Eye className="w-3.5 h-3.5" /> View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="px-6 py-4 border-t flex items-center justify-between flex-wrap gap-3"
            style={{ borderColor: 'var(--border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Showing{' '}
              <span className="font-semibold" style={{ color: 'var(--text)' }}>
                {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, submissions.length)}
              </span>{' '}
              of{' '}
              <span className="font-semibold" style={{ color: 'var(--text)' }}>
                {submissions.length}
              </span>{' '}
              submissions
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {getPageNumbers().map((page, i) =>
                page === '...' ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="w-8 h-8 flex items-center justify-center text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => goToPage(page as number)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold transition-all"
                    style={{
                      background: currentPage === page ? '#3B82F6' : 'var(--bg)',
                      border: `1px solid ${currentPage === page ? '#3B82F6' : 'var(--border)'}`,
                      color: currentPage === page ? '#fff' : 'var(--text)',
                      cursor: 'pointer',
                    }}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text)',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1,
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}