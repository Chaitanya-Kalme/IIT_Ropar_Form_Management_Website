// app/api/submissions/getAllSubmissions/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { SubmissionStatus } from '../../../../../generated/prisma/enums';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const date   = searchParams.get('date');
    const search = searchParams.get('search');
    const formId = searchParams.get('formId'); // ← new

    const statusEnumMap: Record<string, SubmissionStatus> = {
      Approved: SubmissionStatus.Approved,
      Pending:  SubmissionStatus.Pending,
      Rejected: SubmissionStatus.Rejected,
    };
    const parsedStatus =
      status && status !== 'All' ? statusEnumMap[status] : undefined;

    const submissions = await prisma.formSubmissions.findMany({
      where: {
        // ── new: filter by specific form if formId provided ──
        ...(formId && { formId: parseInt(formId, 10) }),
        ...(parsedStatus && { overallStatus: parsedStatus }),
        ...(date && {
          createdAt: {
            gte: new Date(`${date}T00:00:00.000Z`),
            lte: new Date(`${date}T23:59:59.999Z`),
          },
        }),
        ...(search && {
          OR: [
            { user: { userName: { contains: search, mode: 'insensitive' } } },
            { user: { email:    { contains: search, mode: 'insensitive' } } },
          ],
        }),
      },
      include: {
        user: {
          select: { id: true, userName: true, email: true },
        },
        form: {
          select: { id: true, title: true, formStatus: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        formSubmissions: submissions,
        _count: { formSubmissions: submissions.length },
        // ── return active formId so frontend can show context banner ──
        activeFormId: formId ? parseInt(formId, 10) : null,
        activeFormTitle: formId && submissions.length > 0
          ? submissions[0].form.title
          : null,
      },
    });
  } catch (error: any) {
    console.error('[getAllSubmissions]', error);
    return NextResponse.json(
      { success: false, message: error.message ?? 'Internal server error' },
      { status: 500 },
    );
  }
}