'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/navigation';
import { statsData, weeklyData, pieData, submissions } from '@/lib/data';
import {
  FileStack, CheckCircle, XCircle, Clock, AlertTriangle,
  TrendingUp, TrendingDown, Eye, ArrowRight
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useRequireAuth';

const statCards = [
  { key: 'allSubmissions', label: 'All Submissions', value: statsData.allSubmissions, icon: FileStack, color: '#3B82F6', bg: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', darkBg: 'rgba(59,130,246,0.12)', href: '/all-submissions', trend: '+12%' },
  { key: 'accepted', label: 'Accepted', value: statsData.accepted, icon: CheckCircle, color: '#22C55E', bg: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)', darkBg: 'rgba(34,197,94,0.12)', href: '/all-submissions?status=Accepted', trend: '+8%' },
  { key: 'rejected', label: 'Rejected', value: statsData.rejected, icon: XCircle, color: '#EF4444', bg: 'linear-gradient(135deg,#FFF5F5,#FEE2E2)', darkBg: 'rgba(239,68,68,0.12)', href: '/all-submissions?status=Rejected', trend: '-3%' },
  { key: 'pending', label: 'Pending', value: statsData.pending, icon: Clock, color: '#F59E0B', bg: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)', darkBg: 'rgba(245,158,11,0.12)', href: '/pending-approvals', trend: '+5%' },
  { key: 'expired', label: 'Expired', value: statsData.expired, icon: AlertTriangle, color: '#94A3B8', bg: 'linear-gradient(135deg,#F8FAFC,#F1F5F9)', darkBg: 'rgba(148,163,184,0.12)', href: '/all-submissions?status=Expired', trend: '-1%' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { isLoading, currentUser } = useRequireAuth();

  // Block render until session resolves — prevents flash of protected content
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#1E3A8A]" />
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          Welcome back, <span className="gradient-text">{currentUser?.name?.split(' ')[0] ?? 'Verifier'}</span> 👋
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Here's what's happening in your verification queue today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, color, bg, darkBg, href, trend }) => (
          <div key={label} className="stat-card group" onClick={() => router.push(href)}
            style={{ '--hover-bg': darkBg } as React.CSSProperties}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: bg }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>{value}</div>
            <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>{label}</div>
            <div className="flex items-center gap-1">
              {trend.startsWith('+')
                ? <TrendingUp className="w-3 h-3 text-green-500" />
                : <TrendingDown className="w-3 h-3 text-red-400" />}
              <span className="text-xs font-semibold" style={{ color: trend.startsWith('+') ? '#22C55E' : '#EF4444' }}>{trend}</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>this week</span>
            </div>
            {/* Bottom glow line */}
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
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Last 7 days activity</p>
            </div>
            <div className="flex gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded inline-block" style={{ background: '#3B82F6' }} />Submitted</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded inline-block" style={{ background: '#22C55E' }} />Accepted</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded inline-block" style={{ background: '#EF4444' }} />Rejected</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13 }} />
              <Line type="monotone" dataKey="submissions" stroke="#3B82F6" strokeWidth={2.5} dot={{ fill: '#3B82F6', r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="accepted" stroke="#22C55E" strokeWidth={2.5} dot={{ fill: '#22C55E', r: 4 }} />
              <Line type="monotone" dataKey="rejected" stroke="#EF4444" strokeWidth={2.5} dot={{ fill: '#EF4444', r: 4 }} />
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
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
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

      {/* Recent Submissions */}
      <div className="content-card">
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h3 className="font-bold text-base" style={{ color: 'var(--text)' }}>Recent Submissions</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Latest 5 form submissions</p>
          </div>
          <Link href="/all-submissions"
            className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
            style={{ color: '#3B82F6' }}>
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Form Name</th>
                <th>Submitted</th>
                <th>Level</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.slice(0, 5).map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: `hsl(${s.studentName.charCodeAt(0) * 7},60%,50%)` }}>
                        {s.studentName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{s.studentName}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.rollNo}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>{s.formName}</span>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.formType}</div>
                  </td>
                  <td className="text-sm" style={{ color: 'var(--text-muted)' }}>{new Date(s.submissionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>L{s.currentLevel}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/ {s.totalLevels}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${s.status.toLowerCase()}`}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor' }} />
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <Link href={`/form-details/${s.id}`}
                      className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
                      style={{ color: '#3B82F6', textDecoration: 'none' }}>
                      <Eye className="w-3.5 h-3.5" /> View
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