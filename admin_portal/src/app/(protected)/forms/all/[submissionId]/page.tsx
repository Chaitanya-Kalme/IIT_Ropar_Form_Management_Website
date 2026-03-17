import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, FileText, Mail, ShieldCheck, User } from 'lucide-react';
import { getSubmissionById } from '@/data/mockData';

const statusStyles: Record<string, string> = {
  Approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default async function SubmissionDetailsPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = await params;
  const submission = getSubmissionById(submissionId);

  if (!submission) {
    notFound();
  }

  return (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <Link href="/forms/all" className="inline-flex items-center gap-2 text-sm font-medium text-[#1E3A8A] dark:text-blue-400 mb-3">
            <ArrowLeft size={16} />
            Back to all submitted forms
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{submission.user}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{submission.formName} submission details</p>
        </div>

        <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold ${statusStyles[submission.status]}`}>
          <ShieldCheck size={16} />
          {submission.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Submission Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <User size={16} className="text-[#1E3A8A]" />
              <span>{submission.user}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Mail size={16} className="text-[#1E3A8A]" />
              <span>{submission.userEmail}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <FileText size={16} className="text-[#1E3A8A]" />
              <span>{submission.rollNumber}</span>
            </div>
          </div>
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p><strong className="text-gray-900 dark:text-white">Department:</strong> {submission.department}</p>
            <p><strong className="text-gray-900 dark:text-white">Submitted:</strong> {submission.dateSubmitted}</p>
            <p><strong className="text-gray-900 dark:text-white">Verifier Level:</strong> {submission.verifierLevel}</p>
            <p><strong className="text-gray-900 dark:text-white">Current Verifier:</strong> {submission.currentVerifier}</p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Form Responses</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Dummy frontend data for the selected submission</p>
            </div>
            <Link
              href={`/forms/available/${submission.formId}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-[#1E3A8A] dark:bg-blue-900/30 dark:text-blue-300 text-sm font-semibold"
            >
              Open Form Dashboard
            </Link>
          </div>

          <div className="space-y-4">
            {Object.entries(submission.responses).map(([label, value]) => (
              <div key={label} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                <p className="text-sm text-gray-900 dark:text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
