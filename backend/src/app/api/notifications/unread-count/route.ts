// app/api/notifications/unread-count/route.ts
// Lightweight endpoint — frontend polls this every 30s

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";


export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const since  = new URL(req.url).searchParams.get("since");

    const count = await prisma.auditLog.count({
      where: {
        submissionId: { not: null },
        actorType: "Verifier",
        action: {
          in: [
            "VERIFICATION_APPROVED",
            "VERIFICATION_REJECTED",
            "VERIFICATION_REMARKED",
            "SUBMISSION_UPDATED",
          ],
        },
        submission: { userId },
        ...(since && { createdAt: { gt: new Date(since) } }),
      },
    });

    return NextResponse.json({ success: true, data: { unreadCount: count } });

  } catch (err) {
    console.error("[GET /api/notifications/unread-count]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}