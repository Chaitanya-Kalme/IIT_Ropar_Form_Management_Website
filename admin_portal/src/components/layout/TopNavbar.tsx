'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import styles from '@/styles/TopNavbar.module.css';

const routeLabels: Record<string, string[]> = {
  '/dashboard': ['Dashboard'],
  '/forms/create': ['Forms Management', 'Create Form'],
  '/forms/available': ['Forms Management', 'Available Forms'],
  '/forms/pending': ['Forms Management', 'Pending Approvals'],
  '/forms/all': ['Forms Management', 'All Submitted Forms'],
  '/users': ['Users Directory'],
  '/members/add': ['Members Management', 'Add Member'],
  '/members/all': ['Members Management', 'All Members'],
  '/activity': ['Activity Logs'],
  '/settings': ['Settings'],
};

export function TopNavbar() {
  const { darkMode, toggleDarkMode, currentUser, notifications, sidebarCollapsed, setSidebarCollapsed } = useApp();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const breadcrumbs = routeLabels[pathname] || ['Dashboard'];

  const notificationItems = [
    { id: 1, text: 'New hostel leave application submitted', time: '5 min ago', unread: true },
    { id: 2, text: "Arjun Sharma's form approved by HOD", time: '1 hour ago', unread: true },
    { id: 3, text: 'Bulk rejection processed for 3 forms', time: '2 hours ago', unread: true },
    { id: 4, text: 'New member Dr. Kavita Rao added', time: 'Yesterday', unread: false },
    { id: 5, text: 'System maintenance scheduled for Sunday', time: '2 days ago', unread: false },
  ];

  return (
    <header className={styles.navbar}>
      {/* Mobile menu */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className={styles.mobileToggle}
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumbs */}
      <div className={styles.breadcrumbs}>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight size={14} className={styles.breadcrumbIcon} />}
            <span
              className={
                idx === breadcrumbs.length - 1
                  ? styles.breadcrumbActive
                  : styles.breadcrumbItem
              }
            >
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Search */}
      <div className={styles.searchWrapper}>
        <Search size={16} className={styles.searchIcon} />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search..."
          className={styles.searchInput}
        />
      </div>

      {/* Notifications */}
      <div className={styles.notificationWrapper}>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className={styles.iconButton}
        >
          <Bell size={20} />
          {notifications > 0 && (
            <span className={styles.notificationBadge}>{notifications}</span>
          )}
        </button>

        {showNotifications && (
          <>
            <div className={styles.overlay} onClick={() => setShowNotifications(false)} />
            <div className={styles.notificationDropdown}>
              <div className={styles.notificationHeader}>
                <h3>Notifications</h3>
                <button className={styles.markRead}>Mark all read</button>
              </div>
              <div className={styles.notificationList}>
                {notificationItems.map(n => (
                  <div
                    key={n.id}
                    className={`${styles.notificationItem} ${n.unread ? styles.unread : ''}`}
                  >
                    <div className={styles.notificationContent}>
                      {n.unread && <span className={styles.dot} />}
                      <div>
                        <p className={styles.notificationText}>{n.text}</p>
                        <p className={styles.notificationTime}>{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Theme toggle */}
      <button onClick={toggleDarkMode} className={styles.iconButton}>
        {darkMode ? (
          <Sun size={20} className={styles.sunIcon} />
        ) : (
          <Moon size={20} />
        )}
      </button>

      {/* Profile */}
      <Link href="/settings" className={styles.profile}>
        <div className={styles.avatar}>{currentUser.initials}</div>
        <div className={styles.profileText}>
          <p className={styles.name}>{currentUser.name}</p>
          <p className={styles.email}>{currentUser.email}</p>
        </div>
      </Link>
    </header>
  );
}
