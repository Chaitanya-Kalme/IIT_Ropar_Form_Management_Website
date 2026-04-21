// app/api/notifications/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { LogAction } from "../../../../generated/prisma/enums";


const NOTIFIABLE_ACTIONS: LogAction[] = [
  LogAction.VERIFICATION_APPROVED,
  LogAction.VERIFICATION_REJECTED,
  LogAction.VERIFICATION_REMARKED,
  LogAction.SUBMISSION_UPDATED,
];


export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") ?? "20");
        const offset = parseInt(searchParams.get("offset") ?? "0");
        const since = searchParams.get("since")            // ISO string, sent by frontend

        const logs = await prisma.auditLog.findMany({
            where: {
                submissionId: { not: null },
                actorType: "Verifier",
                action: { in: NOTIFIABLE_ACTIONS },       
                submission: { is: { userId } },           
            },
            include: {
                submission: {                             
                    include: {
                        form: {
                            select: { id: true, title: true },
                        },
                    },
                },
                actorVerifier: {
                    select: { userName: true, role: true, department: true },
                },
            },
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset,
        });

        const notifications = logs.map((log) => {
            const form = log.submission?.form;
            const verifier = log.actorVerifier;
            const meta = log.meta as Record<string, any> | null;

            let type: "approved" | "rejected" | "pending" | "review" = "review";
            let title = "";
            let description = "";

            switch (log.action) {
                case "VERIFICATION_APPROVED":
                    type = "approved";
                    title = `Form Approved — Level ${meta?.level ?? ""}`;
                    description = `Your "${form?.title}" was approved by ${verifier?.userName} (${verifier?.role?.replace("_", " ")}).`;
                    break;

                case "VERIFICATION_REJECTED":
                    type = "rejected";
                    title = "Form Rejected — Action Required";
                    description = `Your "${form?.title}" was rejected by ${verifier?.userName}.${meta?.remark ? ` Reason: ${meta.remark}` : ""
                        }`;
                    break;

                case "VERIFICATION_REMARKED":
                    type = "review";
                    title = "Remark Added to Your Form";
                    description = `${verifier?.userName} remarked on "${form?.title}": "${meta?.remark ?? ""}"`;
                    break;

                case "SUBMISSION_UPDATED":
                    type = "pending";
                    title = "Forwarded to Next Verifier";
                    description = `Your "${form?.title}" moved to Level ${log.submission?.currentLevel} for review.`;
                    break;
            }

            return {
                id: log.id,
                type,
                title,
                description,
                time: log.createdAt,
                submissionId: log.submissionId,
                formId: form?.id,
                formTitle: form?.title,
            };
        });

        // Unread = everything after the last-seen timestamp sent by client
        const unreadCount = since
            ? notifications.filter((n) => new Date(n.time) > new Date(since)).length
            : notifications.length;

        return NextResponse.json({
            success: true,
            data: { notifications, unreadCount },
        });

    } catch (err) {
        console.error("[GET /api/notifications]", err);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}