// app/history/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle, Clock, AlertCircle, FileText, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
type SubmissionStatus = "Pending" | "Approved" | "Rejected";

interface VerifierInfo {
  userName:   string;
  role:       string;
  department: string;
}

interface VerificationAction {
  id:         string;
  level:      number;
  status:     SubmissionStatus;
  remark:     string | null;
  actionAt:   string;
  verifier:   VerifierInfo;
}

interface FormVerifierLevel {
  level:    number;
  verifier: VerifierInfo;
}

// ✅ matches actual API shape: { "field-0": { label: string; value: string } }
type FormData = Record<string, { label: string; value: string }>;

interface Submission {
  id:                  string;
  overallStatus:       SubmissionStatus;
  currentLevel:        number;
  createdAt:           string;
  updatedAt:           string;
  formData:            FormData;
  form: {
    id:            number;
    title:         string;
    description:   string;
    deadline:      string | null;
    verifiersList: FormVerifierLevel[];
  };
  verificationActions: VerificationAction[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const statusConfig: Record<
  SubmissionStatus,
  { icon: React.ElementType; color: string; bg: string; border: string; label: string }
> = {
  Approved: {
    icon: CheckCircle2, color: "text-green-700",
    bg: "bg-green-50", border: "border-green-200", label: "Approved",
  },
  Rejected: {
    icon: XCircle,      color: "text-red-700",
    bg: "bg-red-50",   border: "border-red-200",   label: "Rejected",
  },
  Pending: {
    icon: Clock,        color: "text-yellow-700",
    bg: "bg-yellow-50", border: "border-yellow-200", label: "Pending",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatFieldValue(value: string): string {
  // Detect ISO date strings like "2026-04-18" and reformat them
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  }
  return value;
}

// ── Verifier Chain ────────────────────────────────────────────────────────────
function VerifierChain({
  verifiersList,
  actions,
  currentLevel,
  overallStatus,
}: {
  verifiersList: FormVerifierLevel[];
  actions:       VerificationAction[];
  currentLevel:  number;
  overallStatus: SubmissionStatus;
}) {
  const actionByLevel = Object.fromEntries(actions.map((a) => [a.level, a]));

  return (
    <div>
      {verifiersList.map((vl, idx) => {
        const action     = actionByLevel[vl.level];
        const isDone     = !!action;
        const isCurrent  = !isDone && vl.level === currentLevel && overallStatus === "Pending";
        const isLast     = idx === verifiersList.length - 1;

        type StepState = SubmissionStatus | "current" | "waiting";
        const stepState: StepState = isDone
          ? action.status
          : isCurrent ? "current" : "waiting";

        const circleClass = cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold",
          stepState === "Approved" && "border-green-400  bg-green-50  text-green-700",
          stepState === "Rejected" && "border-red-400    bg-red-50    text-red-700",
          stepState === "Pending"  && "border-yellow-400 bg-yellow-50 text-yellow-700",
          stepState === "current"  && "border-blue-400   bg-blue-50   text-blue-700 animate-pulse",
          stepState === "waiting"  && "border-gray-200   bg-gray-50   text-gray-400",
        );

        const cardClass = cn(
          "mb-3 flex-1 rounded-xl border p-3.5",
          stepState === "Approved" && "border-green-100  bg-green-50/40",
          stepState === "Rejected" && "border-red-100    bg-red-50/40",
          stepState === "Pending"  && "border-yellow-100 bg-yellow-50/40",
          stepState === "current"  && "border-blue-200   bg-blue-50/60 shadow-sm",
          stepState === "waiting"  && "border-gray-100   bg-gray-50/40",
        );

        const pillClass = cn(
          "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
          stepState === "Approved" && "bg-green-100  text-green-700  border-green-200",
          stepState === "Rejected" && "bg-red-100    text-red-700    border-red-200",
          stepState === "Pending"  && "bg-yellow-100 text-yellow-700 border-yellow-200",
          stepState === "current"  && "bg-blue-100   text-blue-700   border-blue-200",
          stepState === "waiting"  && "bg-gray-100   text-gray-500   border-gray-200",
        );

        const pillLabel =
          stepState === "current" ? "Awaiting" :
          stepState === "waiting" ? "Upcoming" : stepState;

        return (
          <div key={vl.level} className="flex gap-4">
            {/* Spine */}
            <div className="flex flex-col items-center">
              <div className={circleClass}>
                {stepState === "Approved" && <CheckCircle2 className="h-4 w-4" />}
                {stepState === "Rejected" && <XCircle      className="h-4 w-4" />}
                {(stepState === "Pending" || stepState === "current") && <Clock className="h-4 w-4" />}
                {stepState === "waiting"  && <span>{vl.level}</span>}
              </div>
              {!isLast && (
                <div className={cn(
                  "my-1 w-0.5 flex-1 min-h-[24px]",
                  isDone ? "bg-blue-200" : "bg-gray-100"
                )} />
              )}
            </div>

            {/* Card */}
            <div className={cardClass}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{vl.verifier.userName}</p>
                  <p className="text-xs text-gray-500">
                    {vl.verifier.role.replace(/_/g, " ")} · {vl.verifier.department}
                  </p>
                </div>
                <span className={pillClass}>{pillLabel}</span>
              </div>

              {action && (
                <div className="mt-2 space-y-1.5">
                  {action.remark && (
                    <div className="flex items-start gap-1.5 rounded-lg bg-white/70 border border-white px-2.5 py-2">
                      <AlertCircle className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-gray-600 italic">"{action.remark}"</p>
                    </div>
                  )}
                  <p className="text-[10px] text-gray-400">{formatDate(action.actionAt)}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SubmissionDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/history/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setSubmission(json.data);
        else setError(json.message ?? "Failed to load");
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Loading skeleton ───────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl space-y-4 animate-pulse">
        <div className="h-8 w-40 rounded-lg bg-gray-200" />
        <div className="h-36 rounded-2xl bg-gray-200" />
        <div className="h-64 rounded-2xl bg-gray-200" />
        <div className="h-48 rounded-2xl bg-gray-200" />
      </div>
    </div>
  );

  // ── Error ──────────────────────────────────────────────────
  if (error || !submission) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-3">📭</p>
        <p className="font-semibold text-gray-700">{error ?? "Submission not found"}</p>
        <Button onClick={() => router.back()} className="mt-4" variant="outline" size="sm">
          Go back
        </Button>
      </div>
    </div>
  );

  const statusCfg  = statusConfig[submission.overallStatus];
  const StatusIcon = statusCfg.icon;

  // ✅ formData is { "field-0": { label, value }, ... } — sort by key index
  const formFields = Object.entries(submission.formData).sort(([a], [b]) => {
    const ai = parseInt(a.replace("field-", ""));
    const bi = parseInt(b.replace("field-", ""));
    return ai - bi;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 space-y-4">

        {/* Back */}
        <Button
          variant="ghost" size="sm"
          onClick={() => router.back()}
          className="gap-1.5 text-gray-500 hover:text-gray-900 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {/* ── Header card ─────────────────────────────────────── */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-600 to-blue-400" />
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 border border-blue-100">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="font-bold text-gray-900 text-base leading-tight">
                    {submission.form.title}
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">{submission.form.description}</p>
                </div>
              </div>

              {/* Overall status badge */}
              <div className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 shrink-0",
                statusCfg.bg, statusCfg.border
              )}>
                <StatusIcon className={cn("h-3.5 w-3.5", statusCfg.color)} />
                <span className={cn("text-xs font-semibold", statusCfg.color)}>
                  {statusCfg.label}
                </span>
              </div>
            </div>

            {/* Meta grid */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { label: "Submitted",     value: formatDate(submission.createdAt) },
                { label: "Last Updated",  value: formatDate(submission.updatedAt) },
                {
                  label: "Progress",
                  value: `Level ${submission.currentLevel} / ${submission.form.verifiersList.length}`,
                },
              ].map((m) => (
                <div key={m.label} className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2.5">
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{m.label}</p>
                  <p className="text-xs font-semibold text-gray-800 mt-0.5">{m.value}</p>
                </div>
              ))}
            </div>

            {/* Deadline warning if present */}
            {submission.form.deadline && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-orange-50 border border-orange-100 px-3 py-2">
                <CalendarDays className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                <p className="text-xs text-orange-700">
                  <span className="font-semibold">Deadline:</span>{" "}
                  {formatDate(submission.form.deadline)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Verifier chain ──────────────────────────────────── */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold">
              {submission.form.verifiersList.length}
            </span>
            Verification Chain
          </h2>
          <VerifierChain
            verifiersList={submission.form.verifiersList}
            actions={submission.verificationActions}
            currentLevel={submission.currentLevel}
            overallStatus={submission.overallStatus}
          />
        </div>

        {/* ── Submitted form data ─────────────────────────────── */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Submitted Data</h2>
          <div className="space-y-2">
            {formFields.map(([key, field]) => (
              <div
                key={key}
                className="flex items-start gap-3 rounded-xl bg-gray-50 border border-gray-100 px-3.5 py-3"
              >
                <span className="text-xs font-semibold text-gray-500 w-28 shrink-0 pt-0.5 uppercase tracking-wide">
                  {field.label}   {/* ✅ use label from the object, not the key */}
                </span>
                <span className="text-xs font-medium text-gray-900 break-all">
                  {formatFieldValue(field.value)}  {/* ✅ use value, format dates nicely */}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}