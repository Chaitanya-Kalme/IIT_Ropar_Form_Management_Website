'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { currentUser } from '@/lib/data';
import Link from 'next/link';
import {
  User, Mail, Building, Shield, Edit2, LogOut, CheckCircle,
  XCircle, FileStack, Camera, Save, X
} from 'lucide-react';

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [dept, setDept] = useState(currentUser.department);
  const [toast, setToast] = useState('');

  const handleSave = () => {
    setEditing(false);
    setToast('Profile updated successfully!');
    setTimeout(() => setToast(''), 3000);
  };

  const stats = [
    { label: 'Forms Handled', val: currentUser.formsHandled, icon: FileStack, color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Approvals', val: currentUser.approvalsCompleted, icon: CheckCircle, color: '#22C55E', bg: '#F0FDF4' },
    { label: 'Rejections', val: currentUser.rejections, icon: XCircle, color: '#EF4444', bg: '#FFF5F5' },
  ];

  return (
    <DashboardLayout>
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-lg animate-slide-up"
          style={{ background: 'linear-gradient(135deg,#22C55E,#16a34a)' }}>
          ✓ {toast}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Profile</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage your account settings</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Profile Card */}
        <div className="xl:col-span-1">
          <div className="content-card p-6 text-center">
            {/* Avatar */}
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-white text-3xl font-bold mx-auto"
                style={{ background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)' }}>
                {currentUser.avatar}
              </div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg,#14B8A6,#0D9488)', border: 'none', cursor: 'pointer' }}>
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>{name}</h3>
            <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{currentUser.role}</p>
            <span className="badge" style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>
              <Shield className="w-3 h-3" />
              Verifier Authority
            </span>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t" style={{ borderColor: 'var(--border)' }}>
              {stats.map(({ label, val, icon: Icon, color, bg }) => (
                <div key={label} className="text-center">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-1.5" style={{ background: bg }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div className="text-xl font-bold" style={{ color }}>{val}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-2.5 mt-6 pt-5 border-t" style={{ borderColor: 'var(--border)' }}>
              <button onClick={() => setEditing(true)}
                className="btn-primary w-full justify-center" style={{ width: '100%' }}>
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
              <Link href="/login"
                className="btn-outline w-full justify-center flex items-center gap-2"
                style={{ width: '100%', color: '#EF4444', borderColor: '#FCA5A5', textDecoration: 'none' }}>
                <LogOut className="w-4 h-4" /> Logout
              </Link>
            </div>
          </div>
        </div>

        {/* Edit / Info Panel */}
        <div className="xl:col-span-2 space-y-5">
          <div className="content-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-base" style={{ color: 'var(--text)' }}>
                {editing ? 'Edit Profile' : 'Account Information'}
              </h3>
              {editing && (
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="btn-outline" style={{ padding: '7px 14px' }}>
                    <X className="w-4 h-4" /> Cancel
                  </button>
                  <button onClick={handleSave} className="btn-primary" style={{ padding: '7px 14px' }}>
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', val: name, icon: User, setter: setName, editable: true },
                { label: 'Email Address', val: email, icon: Mail, setter: setEmail, editable: true },
                { label: 'Department', val: dept, icon: Building, setter: setDept, editable: true },
                { label: 'Role', val: currentUser.role, icon: Shield, setter: null, editable: false },
              ].map(({ label, val, icon: Icon, setter, editable }) => (
                <div key={label} className="rounded-xl p-4" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" style={{ color: '#3B82F6' }} />
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</p>
                  </div>
                  {editing && editable && setter ? (
                    <input type="text" value={val} onChange={e => setter(e.target.value)}
                      className="form-input" style={{ padding: '7px 12px', fontSize: 14 }} />
                  ) : (
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{val}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Activity summary */}
          <div className="content-card p-6">
            <h3 className="font-bold text-base mb-5" style={{ color: 'var(--text)' }}>Performance Summary</h3>
            <div className="space-y-4">
              {[
                { label: 'Approval Rate', pct: Math.round((currentUser.approvalsCompleted / currentUser.formsHandled) * 100), color: '#22C55E' },
                { label: 'Rejection Rate', pct: Math.round((currentUser.rejections / currentUser.formsHandled) * 100), color: '#EF4444' },
                { label: 'Completion Rate', pct: Math.round(((currentUser.approvalsCompleted + currentUser.rejections) / currentUser.formsHandled) * 100), color: '#3B82F6' },
              ].map(({ label, pct, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span style={{ color: 'var(--text)' }}>{label}</span>
                    <span className="font-bold" style={{ color }}>{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'var(--border)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
