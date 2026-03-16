import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowUpRight,
  Calendar,
  CheckCircle,
  Clock,
  Edit2,
  FileText,
  Layers3,
  Users,
  XCircle,
} from 'lucide-react';
import styles from '@/styles/DashboardPage.module.css';
import {
  getFormById,
  getRecentSubmissions,
  getSubmissionStats,
  getSubmissionsForForm,
} from '@/data/mockData';

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Approved: styles.statusApproved,
    Pending: styles.statusPending,
    Rejected: styles.statusRejected,
  };

  return map[status] || styles.statusDefault;
};

export default async function FormDashboardPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  const form = getFormById(formId);

  if (!form) {
    notFound();
  }

  const submissions = getSubmissionsForForm(formId);
  const stats = getSubmissionStats(submissions);
  const recentSubmissions = getRecentSubmissions(formId, 5);

  const statCards = [
    {
      label: 'Total Submissions',
      value: stats.total,
      href: `/forms/all?formId=${form.id}`,
      icon: <Users size={22} />,
      color: '#0891B2',
      bg: '#ECFEFF',
    },
    {
      label: 'Approved',
      value: stats.approved,
      href: `/forms/all?formId=${form.id}&status=Approved`,
      icon: <CheckCircle size={22} />,
      color: '#16A34A',
      bg: '#F0FDF4',
    },
    {
      label: 'Pending',
      value: stats.pending,
      href: `/forms/all?formId=${form.id}&status=Pending`,
      icon: <Clock size={22} />,
      color: '#D97706',
      bg: '#FFFBEB',
    },
    {
      label: 'Rejected',
      value: stats.rejected,
      href: `/forms/all?formId=${form.id}&status=Rejected`,
      icon: <XCircle size={22} />,
      color: '#DC2626',
      bg: '#FFF1F2',
    },
  ];

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.pageHeader}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>{form.name}</h1>
            <p className={styles.pageSubtitle}>{form.description}</p>
          </div>
          <div className={styles.headerActions}>
            <Link href={`/forms/available/${form.id}/edit`} className={styles.primaryAction}>
              <Edit2 size={16} />
              Edit Form
            </Link>
            <Link href={`/forms/all?formId=${form.id}`} className={styles.secondaryAction}>
              <ArrowUpRight size={16} />
              View All Submissions
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className={`${styles.statCard} ${styles.statCardLink}`}>
            <div className={styles.statTop}>
              <div className={styles.iconBox} style={{ backgroundColor: card.bg, color: card.color }}>
                {card.icon}
              </div>
              <ArrowUpRight size={14} className={styles.statActionIcon} />
            </div>
            <p className={styles.statValue}>{card.value}</p>
            <p className={styles.statLabel}>{card.label}</p>
          </Link>
        ))}
      </div>

      <div className={styles.chartGrid}>
        <div className={styles.chartCardLarge}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Form Overview</h3>
            <p className={styles.chartSubtitle}>Current frontend-only metadata for this form</p>
          </div>
          <div className={styles.infoGrid}>
            <div className={styles.infoTile}>
              <Layers3 size={18} />
              <div>
                <span className={styles.infoLabel}>Category</span>
                <strong>{form.category}</strong>
              </div>
            </div>
            <div className={styles.infoTile}>
              <Calendar size={18} />
              <div>
                <span className={styles.infoLabel}>Deadline</span>
                <strong>{form.deadline}</strong>
              </div>
            </div>
            <div className={styles.infoTile}>
              <FileText size={18} />
              <div>
                <span className={styles.infoLabel}>Fields</span>
                <strong>{form.fields.length} configured</strong>
              </div>
            </div>
            <div className={styles.infoTile}>
              <Clock size={18} />
              <div>
                <span className={styles.infoLabel}>Updated</span>
                <strong>{form.lastUpdated}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Verification Flow</h3>
            <p className={styles.chartSubtitle}>Approval chain for this form</p>
          </div>
          <div className={styles.statusList}>
            {form.verificationFlow.map((level, index) => (
              <div key={level} className={styles.flowStep}>
                <span className={styles.flowIndex}>{index + 1}</span>
                <span>{level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div>
            <h3 className={styles.chartTitle}>Recent {form.name} Submissions</h3>
            <p className={styles.chartSubtitle}>Latest submissions filtered by this form</p>
          </div>

          <Link href={`/forms/all?formId=${form.id}`} className={styles.viewAllBtn}>
            View All <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                {['Applicant', 'Submitted On', 'Department', 'Current Level', 'Status', 'Action'].map((heading) => (
                  <th key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentSubmissions.map((submission) => (
                <tr key={submission.id}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatar}>
                        {submission.user.split(' ').map((name) => name[0]).join('')}
                      </div>
                      <div>
                        <div>{submission.user}</div>
                        <div className={styles.subtleText}>{submission.rollNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td>{submission.dateSubmitted}</td>
                  <td>{submission.department}</td>
                  <td>
                    <span className={styles.levelBadge}>{submission.currentVerifier}</span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${statusBadge(submission.status)}`}>
                      {submission.status}
                    </span>
                  </td>
                  <td>
                    <Link href={`/forms/all/${submission.id}`} className={styles.inlineLink}>
                      View details
                    </Link>
                  </td>
                </tr>
              ))}
              {recentSubmissions.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.emptyCell}>
                    No submissions found for this form yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
