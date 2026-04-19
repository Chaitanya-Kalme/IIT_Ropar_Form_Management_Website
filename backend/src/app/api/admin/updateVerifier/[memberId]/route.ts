import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ActorType, LogAction, Role } from "../../../../../../generated/prisma/enums";

export async function PUT(
  req: NextRequest,
  { params }: { params: { memberId: string } }
) {
  try {
    const { memberId } = await params;

    // ── Auth check ───────────────────────────────────────────
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "Admin") {
      return NextResponse.json(
        { success: false, message: "Admin is not logged in" },
        { status: 401 }
      );
    }

    // ── Parse body ───────────────────────────────────────────
    const { memberName, email, mobileNo, department, role } =
      await req.json();

    // ── Validation ───────────────────────────────────────────
    if (!memberName || !email || !mobileNo || !department || !role) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format." },
        { status: 400 }
      );
    }

    const validRoles = Object.values(Role);
    if (!validRoles.includes(role as Role)) {
      return NextResponse.json(
        {
          success: false,
          message: `Role must be one of: ${validRoles.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // ── Check if verifier exists ─────────────────────────────
    const existingVerifier = await prisma.verifier.findFirst({
      where: { id: memberId },
    });

    if (!existingVerifier) {
      return NextResponse.json(
        { success: false, message: "Verifier not found" },
        { status: 404 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ── Email uniqueness check (exclude self) ────────────────
    const duplicate = await prisma.verifier.findUnique({
      where: { email: normalizedEmail },
    });

    if (duplicate && duplicate.id !== memberId) {
      return NextResponse.json(
        {
          success: false,
          message: "Another verifier already exists with this email.",
        },
        { status: 409 }
      );
    }

    // ── Update + audit log in transaction ────────────────────
    const updatedVerifier = await prisma.$transaction(async (tx) => {
      // 1. Update
      const verifier = await tx.verifier.update({
        where: { id: memberId },
        data: {
          userName: memberName,
          email,
          mobileNo,
          role: role as Role,
          department,
        },
      });

      // 2. Audit log (diff)
      await tx.auditLog.create({
        data: {
          action: LogAction.VERIFIER_UPDATED,
          entity: "Verifier",
          entityId: verifier.id,
          actorType: ActorType.User,
          actorVerifierId: session.user.id,
          actorUserId: null,
          diff: {
            before: {
              userName: existingVerifier.userName,
              email: existingVerifier.email,
              mobileNo: existingVerifier.mobileNo,
              role: existingVerifier.role,
              department: existingVerifier.department,
            },
            after: {
              userName: verifier.userName,
              email: verifier.email,
              mobileNo: verifier.mobileNo,
              role: verifier.role,
              department: verifier.department,
            },
          },
          meta: {
            ip:
              req.headers.get("x-forwarded-for") ??
              req.headers.get("x-real-ip") ??
              "unknown",
            userAgent: req.headers.get("user-agent") ?? "unknown",
            adminEmail: session.user.email,
          },
        },
      });

      return verifier;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Verifier updated successfully.",
        data: updatedVerifier,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[PUT /api/admin/registerVerifier/:memberId]", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message ?? "Internal server error.",
      },
      { status: 500 }
    );
  }
}