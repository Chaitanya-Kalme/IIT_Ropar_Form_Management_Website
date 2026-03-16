import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Building2, Calendar, Edit2, Mail, Phone, Shield, Workflow, BadgeCheck, BriefcaseBusiness } from 'lucide-react';
import styles from '@/styles/DashboardPage.module.css';
import { getActivitiesForAdmin, getMemberById, mockSubmissions } from '@/data/mockData';

const roleBadgeColors: Record<string, string> = {
  Caretaker: styles.statusPending,
  HOD: styles.levelBadge,
  Dean: styles.statusApproved,
  Faculty: styles.statusDefault,
  Admin: styles.statusRejected,
};

export default async function MemberDashboardPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const member = getMemberById(memberId);

  if (!member) {
    notFound();
  }

  const activities = getActivitiesForAdmin(member.name).slice(0, 5);
  const submissionsInQueue = mockSubmissions.filter((submission) => submission.currentVerifier === member.role);

  const stats = [
    {
      label: 'Role',
      value: member.role,
      icon: <Shield size={20} />,
      iconStyle: { backgroundColor: '#dbeafe', color: '#2563eb' },
    },
    {
      label: 'Department',
      value: member.department,
      icon: <Building2 size={20} />,
      iconStyle: { backgroundColor: '#dcfce7', color: '#15803d' },
    },
    {
      label: 'Active Queue',
      value: submissionsInQueue.length.toString(),
      icon: <Workflow size={20} />,
      href: `/forms/pending?verifier=${encodeURIComponent(member.role)}`,
      iconStyle: { backgroundColor: '#fef3c7', color: '#b45309' },
    },
    {
      label: 'Activities Logged',
      value: activities.length.toString(),
      icon: <Calendar size={20} />,
      href: `/activity?admin=${encodeURIComponent(member.name)}`,
      iconStyle: { backgroundColor: '#ede9fe', color: '#7c3aed' },
    },
  ];

  return (
    <div className={styles.dashboardWrapper}>
      <section className={styles.memberHero}>
        <div className={styles.memberHeroContent}>
          <img src={member.avatar} alt={member.name} className={styles.memberPhoto} />
          <div className={styles.memberHeroMeta}>
            <h1 className={styles.memberHeroTitle}>{member.name}</h1>
            <p className={styles.memberHeroSubtitle}>Member dashboard for frontend-only details, assignments, recent actions, and filtered workflow access.</p>
            <div className={styles.memberBadgeRow}>
              <span className={styles.memberBadge}>
                <BadgeCheck size={14} />
                {member.role}
              </span>
              <span className={styles.memberBadge}>
                <BriefcaseBusiness size={14} />
                {member.department}
              </span>
              <span className={styles.memberBadge}>
                <Calendar size={14} />
                Joined {member.joinedDate}
              </span>
            </div>
          </div>
        </div>
        <div className={styles.memberHeroActions}>
          <Link href={`/members/all/${member.id}/edit`} className={styles.primaryAction}>
            <Edit2 size={16} />
            Edit Member
          </Link>
          <Link href={`/activity?admin=${encodeURIComponent(member.name)}`} className={styles.secondaryAction}>
            <ArrowUpRight size={16} />
            View All Activity
          </Link>
        </div>
      </section>

      <div className={styles.statsGrid}>
        {stats.map((stat) => {
          const content = (
            <>
              <div className={styles.statTop}>
                <div className={styles.iconBox} style={stat.iconStyle}>{stat.icon}</div>
                {stat.href && <ArrowUpRight size={14} className={styles.statActionIcon} />}
              </div>
              <p className={styles.statValue}>{stat.value}</p>
              <p className={styles.statLabel}>{stat.label}</p>
            </>
          );

          return stat.href ? (
            <Link key={stat.label} href={stat.href} className={`${styles.statCard} ${styles.statCardLink} ${styles.memberStatCard}`}>
              {content}
            </Link>
          ) : (
            <div key={stat.label} className={`${styles.statCard} ${styles.memberStatCard}`}>
              {content}
            </div>
          );
        })}
      </div>

      <div className={styles.chartGrid}>
        <div className={`${styles.chartCardLarge} ${styles.memberPanel}`}>
          <div className={styles.memberPanelContent}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Member Profile</h3>
            <p className={styles.chartSubtitle}>Small details and current assignment summary</p>
          </div>
          <div className={styles.infoGrid}>
            <div className={styles.infoTile}>
              <Mail size={18} color="#2563eb" />
              <div>
                <span className={styles.infoLabel}>Email</span>
                <strong>{member.email}</strong>
              </div>
            </div>
            <div className={styles.infoTile}>
              <Phone size={18} color="#0f766e" />
              <div>
                <span className={styles.infoLabel}>Phone</span>
                <strong>{member.phone}</strong>
              </div>
            </div>
            <div className={styles.infoTile}>
              <Building2 size={18} color="#7c3aed" />
              <div>
                <span className={styles.infoLabel}>Office</span>
                <strong>{member.office}</strong>
              </div>
            </div>
            <div className={styles.infoTile}>
              <Calendar size={18} color="#b45309" />
              <div>
                <span className={styles.infoLabel}>Joined</span>
                <strong>{member.joinedDate}</strong>
              </div>
            </div>
          </div>
          </div>
        </div>

        <div className={`${styles.chartCard} ${styles.memberPanel}`}>
          <div className={styles.memberPanelContent}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Current Role</h3>
            <p className={styles.chartSubtitle}>Primary verification responsibility</p>
          </div>
          <div className={styles.statusList}>
            <div className={styles.statusRow}>
              <span>Designation</span>
              <span className={`${styles.statusBadge} ${roleBadgeColors[member.role] ?? styles.statusDefault}`}>{member.role}</span>
            </div>
            <div className={styles.statusRow}>
              <span>Open handled forms</span>
              <span className={styles.statusValue}>{member.activeFormsHandled}</span>
            </div>
            <div className={styles.statusRow}>
              <span>Pending queue</span>
              <span className={styles.statusValue}>{submissionsInQueue.length}</span>
            </div>
          </div>
          </div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div>
            <h3 className={styles.chartTitle}>Recent Activities</h3>
            <p className={styles.chartSubtitle}>Latest logged actions by {member.name}</p>
          </div>
          <Link href={`/activity?admin=${encodeURIComponent(member.name)}`} className={styles.viewAllBtn}>
            View All <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                {['Timestamp', 'Action', 'Target'].map((heading) => <th key={heading}>{heading}</th>)}
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id}>
                  <td>{activity.timestamp}</td>
                  <td>{activity.action}</td>
                  <td>{activity.target}</td>
                </tr>
              ))}
              {activities.length === 0 && (
                <tr>
                  <td colSpan={3} className={styles.emptyCell}>No recent activities found for this member.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
