'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  FileStack, CheckCircle, XCircle, Clock, AlertTriangle,
  TrendingUp, Eye, ArrowRight, Loader2, Shield,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import Link from 'next/link';
import { useRequireAuth } from '@/hooks/useRequireAuth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
  allSubmissions: number;
  pending: number;
  accepted: number;
  rejected: number;
  expired: number;
  awaitingMyAction: number;
}

interface PieEntry {
  name: string;
  value: number;
  color: string;
}

interface WeeklyEntry {
  day: string;
  submissions: number;
}

interface RecentSubmission {
  id: string;
  studentName: string;
  email: string;
  formId: number;
  formTitle: string;
  deadline: string | null;
  currentLevel: number;
  status: string;
  submissionDate: string;
}

interface AssignedForm {
  id: number;
  title: string;
  status: boolean;
  deadline: string | null;
  myLevel: number | null;
  totalSubmissions: number;
}

interface DashboardData {
  stats: Stats;
  pieData: PieEntry[];
  weeklyData: WeeklyEntry[];
  recentSubmissions: RecentSubmission[];
  assignedForms: AssignedForm[];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { isLoading: authLoading, currentUser } = useRequireAuth();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/verifier/dashboard');
        if (res.status === 401) { router.push('/login'); return; }
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message ?? 'Failed to load dashboard');
        }
        const json = await res.json();
        setData(json.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [authLoading, router]);

  // ── Auth loading ───────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#1E3A8A]" />
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ── Data loading ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--text-muted)' }} />
          <span className="ml-2 text-sm" style={{ color: 'var(--text-muted)' }}>Loading dashboard...</span>
        </div>
      </DashboardLayout>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <AlertTriangle className="w-8 h-8 text-red-400" />
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{error ?? 'No data found'}</p>
          <button onClick={() => window.location.reload()} className="btn-outline text-sm">Retry</button>
        </div>
      </DashboardLayout>
    );
  }

  const { stats, pieData, weeklyData, recentSubmissions, assignedForms } = data;

  const statCards = [
    {
      label: 'All Submissions', value: stats.allSubmissions,
      icon: FileStack, color: '#3B82F6', bg: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)',
      href: '/all-submissions',
    },
    {
      label: 'Accepted', value: stats.accepted,
      icon: CheckCircle, color: '#22C55E', bg: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)',
      href: '/all-submissions?status=Accepted',
    },
    {
      label: 'Rejected', value: stats.rejected,
      icon: XCircle, color: '#EF4444', bg: 'linear-gradient(135deg,#FFF5F5,#FEE2E2)',
      href: '/all-submissions?status=Rejected',
    },
    {
      label: 'Pending', value: stats.pending,
      icon: Clock, color: '#F59E0B', bg: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)',
      href: '/all-submissions?status=Pending',
    },
    {
      label: 'Expired', value: stats.expired,
      icon: AlertTriangle, color: '#94A3B8', bg: 'linear-gradient(135deg,#F8FAFC,#F1F5F9)',
      href: '/all-submissions?status=Expired',
    },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            Welcome back, <span className="gradient-text">{currentUser?.name?.split(' ')[0] ?? 'Verifier'}</span> 👋
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Here's what's happening in your verification queue today.
          </p>
        </div>

        {/* Awaiting action badge */}
        {stats.awaitingMyAction > 0 && (
          <Link href="/all-submissions?status=Pending"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: '#FFFBEB', color: '#92400E', border: '1px solid #FCD34D', textDecoration: 'none' }}>
            <Shield className="w-4 h-4" />
            {stats.awaitingMyAction} submission{stats.awaitingMyAction !== 1 ? 's' : ''} awaiting your action
          </Link>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, color, bg, href }) => (
          <div key={label} className="stat-card group cursor-pointer" onClick={() => router.push(href)}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: bg }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>{value}</div>
            <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</div>
            <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: color }} />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Line Chart */}
        <div className="chart-wrapper lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-base" style={{ color: 'var(--text)' }}>Weekly Submissions</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Last 7 days on your assigned forms</p>
            </div>
            <div className="flex gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 rounded inline-block" style={{ background: '#3B82F6' }} />
                Submissions
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13 }} />
              <Line type="monotone" dataKey="submissions" stroke="#3B82F6" strokeWidth={2.5}
                dot={{ fill: '#3B82F6', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="chart-wrapper">
          <div className="mb-5">
            <h3 className="font-bold text-base" style={{ color: 'var(--text)' }}>Status Breakdown</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Overall distribution</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.name}</span>
                <span className="text-xs font-semibold ml-auto" style={{ color: 'var(--text)' }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Submissions */}
        <div className="content-card lg:col-span-2">
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div>
              <h3 className="font-bold text-base" style={{ color: 'var(--text)' }}>Awaiting Your Action</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Submissions currently at your level</p>
            </div>
            <Link href="/all-submissions?status=Pending"
              className="flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: '#3B82F6', textDecoration: 'none' }}>
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Form</th>
                  <th>Submitted</th>
                  <th>Level</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                      No submissions awaiting your action.
                    </td>
                  </tr>
                ) : (
                  recentSubmissions.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: `hsl(${s.studentName.charCodeAt(0) * 7},60%,50%)` }}>
                            {s.studentName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{s.studentName}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm font-medium" style={{ color: 'var(--text)' }}>{s.formTitle}</td>
                      <td className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {new Date(s.submissionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <span className="text-sm font-bold" style={{ color: '#3B82F6' }}>L{s.currentLevel}</span>
                      </td>
                      <td>
                        <Link href={`/form-details/${s.id}`}
                          className="flex items-center gap-1.5 text-sm font-semibold"
                          style={{ color: '#3B82F6', textDecoration: 'none' }}>
                          <Eye className="w-3.5 h-3.5" /> View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assigned Forms */}
        <div className="content-card">
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div>
              <h3 className="font-bold text-base" style={{ color: 'var(--text)' }}>Assigned Forms</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{assignedForms.length} form{assignedForms.length !== 1 ? 's' : ''}</p>
            </div>
            <Link href="/assigned-forms"
              className="flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: '#3B82F6', textDecoration: 'none' }}>
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {assignedForms.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No forms assigned.</p>
            ) : (
              assignedForms.slice(0, 6).map(f => (
                <Link key={f.id} href={`/assigned-forms/${f.id}`}
                  className="flex items-center justify-between p-3 rounded-xl transition-all group"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', textDecoration: 'none' }}>
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{f.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Level {f.myLevel ?? '—'}
                      </span>
                      {f.deadline && (
                        <>
                          <span style={{ color: 'var(--border)' }}>·</span>
                          <span className="text-xs" style={{
                            color: new Date(f.deadline) < new Date() ? '#EF4444' : 'var(--text-muted)',
                          }}>
                            {new Date(f.deadline) < new Date() ? 'Expired' :
                              new Date(f.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold" style={{ color: '#3B82F6' }}>{f.totalSubmissions}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>submissions</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}