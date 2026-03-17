'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, FileText, Clock, FileStack, Activity,
  User, LogOut, Shield, ChevronLeft, Menu
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#3B82F6' },
  { href: '/assigned-forms', label: 'All Assigned Forms', icon: FileText, color: '#14B8A6' },
  { href: '/pending-approvals', label: 'Pending Approvals', icon: Clock, color: '#F59E0B' },
  { href: '/all-submissions', label: 'All Submissions', icon: FileStack, color: '#8B5CF6' },
  { href: '/activity', label: 'Activity', icon: Activity, color: '#EC4899' },
  { href: '/profile', label: 'Profile', icon: User, color: '#22C55E' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <aside className={`sidebar fixed top-0 left-0 h-screen flex flex-col z-40 ${collapsed ? 'collapsed' : ''}`}
      style={{ background: 'var(--card)', borderRight: '1px solid var(--border)' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'var(--border)', minHeight: 72 }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)' }}>
          <Shield className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden animate-fade-in">
            <p className="font-bold text-sm leading-tight" style={{ color: 'var(--text)' }}>IIT Ropar</p>
            <p className="text-xs leading-tight" style={{ color: 'var(--text-muted)' }}>Form Verification Portal</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, color }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <div key={href} className="relative" onMouseEnter={() => setHoveredItem(href)} onMouseLeave={() => setHoveredItem(null)}>
              <Link href={href} className={`nav-link ${active ? 'active' : ''}`}
                style={active ? { color } : {}}>
                <Icon className="w-4.5 h-4.5 flex-shrink-0" style={{ color: active ? color : 'var(--text-muted)', width: 18, height: 18 }} />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
              {/* Tooltip in collapsed */}
              {collapsed && hoveredItem === href && (
                <div className="tooltip">{label}</div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="relative" onMouseEnter={() => setHoveredItem('logout')} onMouseLeave={() => setHoveredItem(null)}>
          <Link href="/login" className="nav-link">
            <LogOut className="w-4.5 h-4.5 flex-shrink-0 text-red-400" style={{ width: 18, height: 18 }} />
            {!collapsed && <span className="text-red-400">Logout</span>}
          </Link>
          {collapsed && hoveredItem === 'logout' && <div className="tooltip">Logout</div>}
        </div>
      </div>

      {/* Collapse button */}
      <button onClick={onToggle}
        className="absolute -right-3.5 top-20 w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all z-50"
        style={{ background: 'var(--card)', border: '1.5px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }}>
        {collapsed ? <Menu className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </aside>
  );
}
