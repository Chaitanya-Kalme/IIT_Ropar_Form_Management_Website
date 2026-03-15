'use client';

import React from 'react';
import Link from 'next/link';
import styles from '@/styles/DashboardPage.module.css';

import {
  Users, FileText, Send, Clock, CheckCircle, XCircle,
  TrendingUp, TrendingDown, ArrowUpRight,
} from 'lucide-react';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

import { mockSubmissions, chartSubmissionsData, chartStatusData } from '@/data/mockData';

const statCards = [
  { label: 'Total Users', value: '248', trend: '+12%', trendUp: true, icon: <Users size={22} />, color: '#1E3A8A', bg: '#EFF6FF' },
  { label: 'Total Forms Created', value: '42', trend: '+3 this week', trendUp: true, icon: <FileText size={22} />, color: '#7C3AED', bg: '#F5F3FF' },
  { label: 'Total Submitted', value: '1,284', trend: '+8.5%', trendUp: true, icon: <Send size={22} />, color: '#0891B2', bg: '#ECFEFF' },
  { label: 'Pending Verification', value: '87', trend: '-5 today', trendUp: false, icon: <Clock size={22} />, color: '#D97706', bg: '#FFFBEB' },
  { label: 'Approved Forms', value: '1,064', trend: '+92 this week', trendUp: true, icon: <CheckCircle size={22} />, color: '#16A34A', bg: '#F0FDF4' },
  { label: 'Rejected Forms', value: '133', trend: '-2%', trendUp: false, icon: <XCircle size={22} />, color: '#DC2626', bg: '#FFF1F2' },
];

const statusBadge = (status) => {
  const map = {
    Approved: styles.statusApproved,
    Pending: styles.statusPending,
    Rejected: styles.statusRejected,
  };
  return map[status] || styles.statusDefault;
};

export default function DashboardPage() {
  return (
    <div className={styles.dashboardWrapper}>

      {/* Page Title */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <p className={styles.pageSubtitle}>
          Welcome back, Admin. Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {statCards.map((card, i) => (
          <div key={i} className={styles.statCard}>

            <div className={styles.statTop}>
              <div
                className={styles.iconBox}
                style={{ backgroundColor: card.bg, color: card.color }}
              >
                {card.icon}
              </div>

              <div className={`${styles.trend} ${card.trendUp ? styles.trendUp : styles.trendDown}`}>
                {card.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              </div>
            </div>

            <p className={styles.statValue}>{card.value}</p>
            <p className={styles.statLabel}>{card.label}</p>

            <p className={`${styles.statTrendText} ${card.trendUp ? styles.trendUp : styles.trendDown}`}>
              {card.trend}
            </p>

          </div>
        ))}
      </div>

      {/* Charts */}
      <div className={styles.chartGrid}>

        <div className={styles.chartCardLarge}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>Weekly Form Submissions</h3>
              <p className={styles.chartSubtitle}>Last 7 days activity</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartSubmissionsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />

              <Line type="monotone" dataKey="submissions" stroke="#4F46E5" strokeWidth={3} />
              <Line type="monotone" dataKey="approved" stroke="#22C55E" strokeWidth={2} />
              <Line type="monotone" dataKey="rejected" stroke="#EF4444" strokeWidth={2} />

            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Verification Status</h3>
            <p className={styles.chartSubtitle}>Distribution overview</p>
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={chartStatusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {chartStatusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className={styles.statusList}>
            {chartStatusData.map((item) => (
              <div key={item.name} className={styles.statusRow}>
                <div className={styles.statusLeft}>
                  <span
                    className={styles.statusDot}
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}</span>
                </div>
                <span className={styles.statusValue}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Table */}
      <div className={styles.tableCard}>

        <div className={styles.tableHeader}>
          <div>
            <h3 className={styles.chartTitle}>Recent Submissions</h3>
            <p className={styles.chartSubtitle}>Latest form activities</p>
          </div>

          <Link href="/forms/all" className={styles.viewAllBtn}>
            View All <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                {['User', 'Form Type', 'Date Submitted', 'Current Level', 'Status'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {mockSubmissions.slice(0, 6).map((s) => (
                <tr key={s.id}>

                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatar}>
                        {s.user.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span>{s.user}</span>
                    </div>
                  </td>

                  <td>{s.formName}</td>
                  <td>{s.dateSubmitted}</td>

                  <td>
                    <span className={styles.levelBadge}>
                      {s.currentVerifier}
                    </span>
                  </td>

                  <td>
                    <span className={`${styles.statusBadge} ${statusBadge(s.status)}`}>
                      {s.status}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>

    </div>
  );
}