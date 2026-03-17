'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { activityData } from '@/lib/data';
import { CheckCircle, XCircle, FileText, CornerDownLeft, Clock, RefreshCw, Activity } from 'lucide-react';

const iconMap: Record<string, { icon: any; bg: string; color: string }> = {
  check: { icon: CheckCircle, bg: '#F0FDF4', color: '#22C55E' },
  x: { icon: XCircle, bg: '#FFF5F5', color: '#EF4444' },
  file: { icon: FileText, bg: '#EFF6FF', color: '#3B82F6' },
  refresh: { icon: CornerDownLeft, bg: '#FFFBEB', color: '#F59E0B' },
  clock: { icon: Clock, bg: 'var(--bg)', color: '#94A3B8' },
};

const typeLabels: Record<string, { label: string; class: string }> = {
  approved: { label: 'Approved', class: 'badge-accepted' },
  rejected: { label: 'Rejected', class: 'badge-rejected' },
  submitted: { label: 'Submitted', class: 'badge' },
  'sent-back': { label: 'Sent Back', class: 'badge-pending' },
  expired: { label: 'Expired', class: 'badge-expired' },
};

export default function ActivityPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Activity Log</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Recent verification activity across all forms</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Actions', val: activityData.length, color: '#3B82F6', bg: '#EFF6FF' },
          { label: 'Approvals', val: activityData.filter(a => a.type === 'approved').length, color: '#22C55E', bg: '#F0FDF4' },
          { label: 'Rejections', val: activityData.filter(a => a.type === 'rejected').length, color: '#EF4444', bg: '#FFF5F5' },
          { label: 'Sent Back', val: activityData.filter(a => a.type === 'sent-back').length, color: '#F59E0B', bg: '#FFFBEB' },
        ].map(({ label, val, color, bg }) => (
          <div key={label} className="content-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
              <Activity className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color }}>{val}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="content-card p-6">
        <h3 className="font-bold text-base mb-6 flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <RefreshCw className="w-4.5 h-4.5 text-blue-500" style={{ width: 18, height: 18 }} />
          Recent Activity
        </h3>
        <div className="space-y-0">
          {activityData.map((item, i) => {
            const { icon: Icon, bg, color } = iconMap[item.icon] || iconMap.file;
            const typeInfo = typeLabels[item.type] || { label: item.type, class: 'badge' };
            const isLast = i === activityData.length - 1;
            return (
              <div key={item.id} className="flex gap-4">
                {/* Timeline icon + connector */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                    style={{ background: bg, border: `1.5px solid ${color}30` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  {!isLast && (
                    <div className="w-0.5 flex-1 my-1" style={{ background: 'var(--border)', minHeight: 24 }} />
                  )}
                </div>

                {/* Content */}
                <div className={`flex-1 pb-5 ${isLast ? 'pb-0' : ''}`}>
                  <div className="rounded-xl p-4 transition-all"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = color + '60'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}>
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <p className="text-sm font-medium flex-1" style={{ color: 'var(--text)' }}>{item.message}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`badge ${typeInfo.class}`} style={{ fontSize: 11 }}>{typeInfo.label}</span>
                      </div>
                    </div>
                    <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
