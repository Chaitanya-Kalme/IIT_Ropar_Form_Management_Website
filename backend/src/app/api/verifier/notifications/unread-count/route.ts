// app/api/verifier/notifications/unread-count/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { LogAction } from "../../../../../../generated/prisma/enums";


export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const verifierId = session.user.id;
    const since      = new URL(req.url).searchParams.get("since");

    const assignedFormIds = await prisma.formVerifierLevel.findMany({
      where:  { verifierId },
      select: { formId: true, level: true },
    });
    const formIds = assignedFormIds.map((f) => f.formId);

    if (formIds.length === 0) {
      return NextResponse.json({ success: true, data: { unreadCount: 0 } });
    }

    const count = await prisma.auditLog.count({
      where: {
        action:   { in: [LogAction.SUBMISSION_CREATED, LogAction.SUBMISSION_RESUBMITTED] },
        formId:   { in: formIds },
        actorType: "User",
        ...(since && { createdAt: { gt: new Date(since) } }),
      },
    });

    return NextResponse.json({ success: true, data: { unreadCount: count } });
  } catch (err) {
    console.error("[GET /api/verifier/notifications/unread-count]", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}