'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import {
  User, Mail, Building, Shield, LogOut,
  CheckCircle, XCircle, FileStack, Phone, Calendar, Loader2, AlertTriangle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VerifierProfile {
  id: string;
  userName: string;
  email: string;
  role: string;
  department: string;
  mobileNo: string;
  createdAt: string;
}

interface Stats {
  formsHandled: number;
  approvals: number;
  rejections: number;
}

interface ProfileData {
  verifier: VerifierProfile;
  stats: Stats;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/verifier/profile');
        if (res.status === 401) { router.push('/login'); return; }
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message ?? 'Failed to load profile');
        }
        const json = await res.json();
        setData(json.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--text-muted)' }} />
          <span className="ml-2 text-sm" style={{ color: 'var(--text-muted)' }}>Loading profile...</span>
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

  const { verifier, stats } = data;

  const initials = verifier.userName.split(' ').map(n => n[0]).join('').toUpperCase();
  const approvalRate   = stats.formsHandled > 0 ? Math.round((stats.approvals  / stats.formsHandled) * 100) : 0;
  const rejectionRate  = stats.formsHandled > 0 ? Math.round((stats.rejections / stats.formsHandled) * 100) : 0;
  const completionRate = stats.formsHandled > 0 ? Math.round(((stats.approvals + stats.rejections) / stats.formsHandled) * 100) : 0;

  const statCards = [
    { label: 'Forms Handled', val: stats.formsHandled,  icon: FileStack,    color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Approvals',     val: stats.approvals,      icon: CheckCircle,  color: '#22C55E', bg: '#F0FDF4' },
    { label: 'Rejections',    val: stats.rejections,     icon: XCircle,      color: '#EF4444', bg: '#FFF5F5' },
  ];

  const infoFields = [
    { label: 'Full Name',   val: verifier.userName,   icon: User     },
    { label: 'Email',       val: verifier.email,      icon: Mail     },
    { label: 'Department',  val: verifier.department, icon: Building },
    { label: 'Role',        val: verifier.role.replace(/_/g, ' '), icon: Shield },
    { label: 'Mobile',      val: verifier.mobileNo,   icon: Phone    },
    {
      label: 'Member Since',
      val: new Date(verifier.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      icon: Calendar,
    },
  ];

  const performanceBars = [
    { label: 'Approval Rate',    pct: approvalRate,   color: '#22C55E' },
    { label: 'Rejection Rate',   pct: rejectionRate,  color: '#EF4444' },
    { label: 'Completion Rate',  pct: completionRate, color: '#3B82F6' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Profile</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Your account details and performance summary</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ── Left: Profile Card ──────────────────────────────────────────── */}
        <div className="xl:col-span-1">
          <div className="content-card p-6 text-center">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4"
              style={{ background: `hsl(${verifier.userName.charCodeAt(0) * 7},60%,40%)` }}>
              {initials}
            </div>

            <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>{verifier.userName}</h3>
            <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{verifier.email}</p>
            <span className="badge" style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>
              <Shield className="w-3 h-3" />
              {verifier.role.replace(/_/g, ' ')}
            </span>

            {/* Stat mini-cards */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t" style={{ borderColor: 'var(--border)' }}>
              {statCards.map(({ label, val, icon: Icon, color, bg }) => (
                <div key={label} className="text-center">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-1.5" style={{ background: bg }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div className="text-xl font-bold" style={{ color }}>{val}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Logout */}
            <div className="mt-6 pt-5 border-t" style={{ borderColor: 'var(--border)' }}>
              <Link href="/login"
                className="btn-outline w-full justify-center flex items-center gap-2"
                style={{ width: '100%', color: '#EF4444', borderColor: '#FCA5A5', textDecoration: 'none' }}>
                <LogOut className="w-4 h-4" /> Logout
              </Link>
            </div>
          </div>
        </div>

        {/* ── Right: Info + Performance ───────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-5">

          {/* Account Information */}
          <div className="content-card p-6">
            <h3 className="font-bold text-base mb-5" style={{ color: 'var(--text)' }}>Account Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {infoFields.map(({ label, val, icon: Icon }) => (
                <div key={label} className="rounded-xl p-4" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className="w-4 h-4" style={{ color: '#3B82F6' }} />
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</p>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{val || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="content-card p-6">
            <h3 className="font-bold text-base mb-5" style={{ color: 'var(--text)' }}>Performance Summary</h3>
            {stats.formsHandled === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No verification activity yet.</p>
            ) : (
              <div className="space-y-4">
                {performanceBars.map(({ label, pct, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span style={{ color: 'var(--text)' }}>{label}</span>
                      <span className="font-bold" style={{ color }}>{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: 'var(--border)' }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}