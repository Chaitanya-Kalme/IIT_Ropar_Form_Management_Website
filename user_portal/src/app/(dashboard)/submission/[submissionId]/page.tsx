"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formsService } from "@/lib/services";
import type { Submission, WorkflowStep, Comment } from "@/lib/mockApi";
import StatusBadge from "@/components/StatusBadge";
import StatusTracker from "@/components/StatusTracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, MessageSquare, User2 } from "lucide-react";
import { motion } from "framer-motion";

export default function SubmissionDetailPage() {
  const params = useParams<{ submissionId: string }>();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowStep[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.submissionId) return;
    Promise.all([
      formsService.getStatus(params.submissionId),
      formsService.getComments(params.submissionId),
    ]).then(([statusData, commentsData]) => {
      setSubmission(statusData.submission || null);
      setWorkflow(statusData.workflow || []);
      setComments(commentsData);
      setLoading(false);
    });
  }, [params.submissionId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!submission) {
    return <p className="py-12 text-center text-muted-foreground">Submission not found.</p>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-heading text-2xl font-bold">{submission.form_name}</h1>
          <p className="text-sm text-muted-foreground">
            Submitted on {submission.submitted_date} at {submission.submitted_time}
          </p>
        </div>
        <StatusBadge status={submission.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Workflow */}
        <Card className="shadow-card border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50 border-b">
            <CardTitle className="font-heading text-base flex items-center gap-2">
              <div className="h-2 w-2 rounded-full gradient-primary" />
              Approval Workflow
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <StatusTracker steps={workflow} />
          </CardContent>
        </Card>

        {/* Comments */}
        <Card className="shadow-card border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
            <CardTitle className="font-heading text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-amber-600" /> Authority Comments
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            ) : (
              comments.map((comment, i) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl border border-border bg-gradient-to-br from-card to-muted/30 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-secondary">
                        <User2 className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{comment.authority}</p>
                        <p className="text-xs text-muted-foreground">{comment.role}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{comment.date}</p>
                  </div>
                  <p className="text-sm leading-relaxed">{comment.message}</p>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
