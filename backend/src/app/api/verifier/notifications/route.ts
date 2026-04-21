// app/api/verifier/notifications/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { LogAction } from "../../../../../generated/prisma/enums";

type VerifierNotifType = "new_submission" | "resubmission" | "deadline" | "info";

const VERIFIER_NOTIFIABLE_ACTIONS: LogAction[] = [
    LogAction.SUBMISSION_CREATED,
    LogAction.SUBMISSION_RESUBMITTED,
    LogAction.SUBMISSION_UPDATED,
];



export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const verifierId = session.user.id;
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") ?? "20");
        const offset = parseInt(searchParams.get("offset") ?? "0");
        const since = searchParams.get("since");

        // Find all formIds this verifier is assigned to
        const assignedFormIds = await prisma.formVerifierLevel.findMany({
            where: { verifierId },
            select: { formId: true, level: true },
        });
        const formLevelMap = Object.fromEntries(
            assignedFormIds.map((f) => [f.formId, f.level])
        );
        const formIds = assignedFormIds.map((f) => f.formId);

        if (formIds.length === 0) {
            return NextResponse.json({
                success: true,
                data: { notifications: [], unreadCount: 0 },
            });
        }

        // Fetch audit logs for submissions on assigned forms
        // where the submission has reached this verifier's level
        const logs = await prisma.auditLog.findMany({
            where: {
                action: { in: VERIFIER_NOTIFIABLE_ACTIONS },
                formId: { in: formIds },
                actorType: "User",                         // triggered by user, not another verifier
                ...(since && { createdAt: { gt: new Date(since) } }),
                submission: {
                    is: {
                        // Only notify when currentLevel matches this verifier's level for that form
                        form: { id: { in: formIds } },
                    },
                },
            },
            include: {
                submission: {
                    include: {
                        user: { select: { userName: true, email: true } },
                        form: { select: { id: true, title: true, deadline: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset,
        });

        // Filter: only logs where submission.currentLevel === this verifier's assigned level
        const filtered = logs.filter((log) => {
            const sub = log.submission;
            if (!sub) return false;
            const myLevel = formLevelMap[sub.formId];
            return sub.currentLevel === myLevel;
        });

        const notifications = filtered.map((log) => {
            const sub = log.submission!;
            const form = sub.form;
            const user = sub.user;

            // ✅ declared here, visible to the whole map callback
            let type: VerifierNotifType = "info";
            let title = "";
            let description = "";

            switch (log.action) {
                case LogAction.SUBMISSION_CREATED:
                    type = "new_submission";
                    title = "New Submission Awaiting Review";
                    description = `${user.userName} submitted "${form.title}" and it's waiting for your approval.`;
                    break;
                case LogAction.SUBMISSION_RESUBMITTED:
                    type = "resubmission";
                    title = "Form Resubmitted";
                    description = `${user.userName} resubmitted "${form.title}" after corrections. Please review again.`;
                    break;
                case LogAction.SUBMISSION_UPDATED:
                    type = "info";
                    title = "Submission Updated";
                    description = `A submission for "${form.title}" was updated and needs your review.`;
                    break;
            }

            // Deadline warning
            if (form.deadline) {
                const daysLeft = Math.ceil(
                    (new Date(form.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                if (daysLeft <= 1 && daysLeft >= 0) {
                    description += ` ⚠️ Deadline is ${daysLeft === 0 ? "today" : "tomorrow"}!`;
                }
            }

            return {
                id: log.id,
                type,
                title,
                description,
                time: log.createdAt,
                submissionId: log.submissionId,
                formId: form.id,
                formTitle: form.title,
            };
        });
        const unreadCount = since
            ? notifications.filter((n) => new Date(n.time) > new Date(since)).length
            : notifications.length;

        return NextResponse.json({ success: true, data: { notifications, unreadCount } });
    } catch (err) {
        console.error("[GET /api/verifier/notifications]", err);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}