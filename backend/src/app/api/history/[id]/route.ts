// app/api/history/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;  // ✅ awaited before use

    if (!id) {
      return NextResponse.json({ success: false, message: "Missing submission ID" }, { status: 400 });
    }

    const submission = await prisma.formSubmissions.findUnique({
      where: { id },             // ✅ now a resolved string
      include: {
        form: {
          include: {
            verifiersList: {
              include: {
                verifier: { select: { userName: true, role: true, department: true } },
              },
              orderBy: { level: "asc" },
            },
          },
        },
        verificationActions: {
          include: {
            verifier: { select: { userName: true, role: true, department: true } },
          },
          orderBy: { level: "asc" },
        },
      },
    });

    if (!submission || submission.userId !== session.user.id) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: submission });
  } catch (err) {
    console.error("[GET /api/history/:id]", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}