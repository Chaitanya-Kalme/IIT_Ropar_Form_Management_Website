// src/app/api/verifier/getAssignedForms/route.ts

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET(req: NextRequest) {
  try {
    // ── Auth ────────────────────────────────────────────────────────
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    if (session.user.portal !== "verifier" && session.user.portal !== "admin") {
      return NextResponse.json(
        { success: false, message: "Access denied. Verifier role required." },
        { status: 403 }
      );
    }

    const verifierId = session.user.id;

    if (!verifierId) {
      return NextResponse.json(
        { success: false, message: "Session is missing user ID." },
        { status: 401 }
      );
    }

    // ── Fetch all FormVerifierLevel entries assigned to this verifier ──
    const assignedLevels = await prisma.formVerifierLevel.findMany({
      where: { verifierId },
      select: {
        level: true,
        form: {
          select: {
            id: true,
            title: true,
            description: true,
            deadline: true,
            formStatus: true,
            createdAt: true,
            formSubmissions: {
              select: {
                overallStatus: true,
                currentLevel: true,
              },
            },
          },
        },
      },
    });

    // ── Shape the response ──────────────────────────────────────────
    const forms = assignedLevels.map(({ level, form }) => {
      const submissions = form.formSubmissions;

      const totalSubmissions = submissions.length;

      // Submissions currently waiting at this verifier's level
      const awaitingReview = submissions.filter(
        (s) => s.currentLevel === level && s.overallStatus === "Pending"
      ).length;

      // ✅ Correct enum values from schema: Pending | Approved | Rejected
      const pending = submissions.filter(
        (s) => s.overallStatus === "Pending"
      ).length;

      const approved = submissions.filter(
        (s) => s.overallStatus === "Approved"
      ).length;

      const rejected = submissions.filter(
        (s) => s.overallStatus === "Rejected"
      ).length;

      const isManuallyClosed = form.formStatus === false;

      const deadlineDate =
        form.deadline ? new Date(form.deadline) : null;

      const isExpired =
        deadlineDate ? new Date() > deadlineDate : false;

      const status: "Active" | "Closed" =
        !isManuallyClosed && !isExpired ? "Active" : "Closed";

      return {
        id: form.id,
        formName: form.title,
        description: form.description,
        deadline: form.deadline,
        createdAt: form.createdAt,
        status,
        level,
        totalSubmissions,
        pending,
        approved,
        rejected,
        awaitingReview,
      };
    });

    const getTime = (d: string | Date | null | undefined) => {
      if (!d) return Number.MAX_SAFE_INTEGER;

      const t = new Date(d).getTime();
      return isNaN(t) ? Number.MAX_SAFE_INTEGER : t;
    };

    forms.sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "Active" ? -1 : 1;
      }

      return getTime(a.deadline) - getTime(b.deadline);
    });

    return NextResponse.json(
      { success: true, data: forms },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("[GET /api/verifier/getAssignedForms]", error);
    return NextResponse.json(
      { success: false, message: error.message ?? "Internal server error." },
      { status: 500 }
    );
  }
}