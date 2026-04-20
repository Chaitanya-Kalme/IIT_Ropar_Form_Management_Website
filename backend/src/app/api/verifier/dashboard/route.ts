// app/api/verifier/dashboard/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role === 'Admin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const verifierId = session.user.id;
        const now = new Date();

        // All submission IDs this verifier has ever acted on or is assigned to
        const assignedLevels = await prisma.formVerifierLevel.findMany({
            where: { verifierId },
            select: { formId: true, level: true },
        });

        const assignedFormIds = assignedLevels.map(l => l.formId);

        const [
            allSubmissions,
            verificationActions,
            recentSubmissions,
            weeklyData,
            assignedForms,
        ] = await Promise.all([
            // All submissions on forms this verifier is part of
            prisma.formSubmissions.findMany({
                where: { formId: { in: assignedFormIds } },
                select: {
                    id: true,
                    overallStatus: true,
                    currentLevel: true,
                    createdAt: true,
                    form: { select: { deadline: true } },
                },
            }),

            // All actions this verifier has taken
            prisma.verificationAction.findMany({
                where: { verifierId },
                select: { submissionId: true, level: true, status: true },
            }),

            // Fetch all pending submissions on assigned forms — filter to verifier's turn in JS below
            prisma.formSubmissions.findMany({
                where: {
                    formId: { in: assignedFormIds },
                    overallStatus: 'Pending',
                },
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { userName: true, email: true } },
                    form: { select: { id: true, title: true, deadline: true } },
                },
            }),

            // Last 7 days — submissions on assigned forms grouped by day
            prisma.$queryRaw<{ day: string; count: bigint }[]>`
                SELECT TO_CHAR("createdAt" AT TIME ZONE 'UTC', 'Dy') as day,
                       COUNT(*) as count
                FROM "FormSubmissions"
                WHERE "createdAt" >= NOW() - INTERVAL '7 days'
                  AND "formId" = ANY(${assignedFormIds}::int[])
                GROUP BY TO_CHAR("createdAt" AT TIME ZONE 'UTC', 'Dy'),
                         DATE_TRUNC('day', "createdAt" AT TIME ZONE 'UTC')
                ORDER BY DATE_TRUNC('day', "createdAt" AT TIME ZONE 'UTC')
            `,

            // Forms this verifier is assigned to with submission counts
            prisma.form.findMany({
                where: { id: { in: assignedFormIds } },
                include: {
                    _count: { select: { formSubmissions: true } },
                    verifiersList: {
                        where: { verifierId },
                        select: { level: true },
                    },
                },
            }),
        ]);

        // ── Derive stats ──────────────────────────────────────────────────────
        const expiredIds = new Set(
            allSubmissions
                .filter(s => s.overallStatus === 'Pending' && s.form.deadline && new Date(s.form.deadline) < now)
                .map(s => s.id)
        );

        const stats = {
            allSubmissions: allSubmissions.length,
            pending:  allSubmissions.filter(s => s.overallStatus === 'Pending'  && !expiredIds.has(s.id)).length,
            accepted: allSubmissions.filter(s => s.overallStatus === 'Approved').length,
            rejected: allSubmissions.filter(s => s.overallStatus === 'Rejected').length,
            expired:  expiredIds.size,
            // Submissions currently waiting for THIS verifier's action
            awaitingMyAction: allSubmissions.filter(s => {
                if (s.overallStatus !== 'Pending') return false;
                const myLevel = assignedLevels.find(l => l.formId === (s as any).formId)?.level;
                return myLevel !== undefined && s.currentLevel === myLevel;
            }).length,
        };

        // ── Pie data ──────────────────────────────────────────────────────────
        const pieData = [
            { name: 'Accepted', value: stats.accepted, color: '#22C55E' },
            { name: 'Pending',  value: stats.pending,  color: '#F59E0B' },
            { name: 'Rejected', value: stats.rejected, color: '#EF4444' },
            { name: 'Expired',  value: stats.expired,  color: '#94A3B8' },
        ];

        // ── Recent submissions — filter to verifier's turn ────────────────────
        // Build a lookup: formId → myLevel
        const formLevelMap = Object.fromEntries(assignedLevels.map(l => [l.formId, l.level]));

        const recent = (Array.isArray(recentSubmissions) ? recentSubmissions : [])
            .filter((s: any) => {
                const myLevel = formLevelMap[s.formId ?? s.form?.id];
                return myLevel !== undefined && s.currentLevel === myLevel;
            })
            .slice(0, 5)
            .map((s: any) => ({
                id: s.id,
                studentName: s.user.userName,
                email: s.user.email,
                formId: s.form.id,
                formTitle: s.form.title,
                deadline: s.form.deadline,
                currentLevel: s.currentLevel,
                status: s.overallStatus,
                submissionDate: s.createdAt,
            }));

        return NextResponse.json({
            success: true,
            data: {
                stats,
                pieData,
                weeklyData: weeklyData.map(d => ({
                    day: d.day,
                    submissions: Number(d.count),
                })),
                recentSubmissions: recent,
                assignedForms: assignedForms.map(f => ({
                    id: f.id,
                    title: f.title,
                    status: f.formStatus,
                    deadline: f.deadline,
                    myLevel: f.verifiersList[0]?.level ?? null,
                    totalSubmissions: f._count.formSubmissions,
                })),
            },
        });
    } catch (error: any) {
        console.error('[Verifier Dashboard GET]', error);
        return NextResponse.json({ success: false, message: error.message ?? 'Internal server error' }, { status: 500 });
    }
}