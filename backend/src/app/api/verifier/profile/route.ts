// app/api/verifier/profile/route.ts
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

        const [verifier, actions] = await Promise.all([
            prisma.verifier.findUnique({
                where: { id: verifierId },
                select: {
                    id: true,
                    userName: true,
                    email: true,
                    role: true,
                    department: true,
                    mobileNo: true,
                    createdAt: true,
                },
            }),
            prisma.verificationAction.findMany({
                where: { verifierId },
                select: { status: true },
            }),
        ]);

        if (!verifier) {
            return NextResponse.json({ success: false, message: 'Verifier not found' }, { status: 404 });
        }

        const formsHandled = actions.length;
        const approvals = actions.filter(a => a.status === 'Approved').length;
        const rejections = actions.filter(a => a.status === 'Rejected').length;

        return NextResponse.json({
            success: true,
            data: {
                verifier,
                stats: {
                    formsHandled,
                    approvals,
                    rejections,
                },
            },
        });
    } catch (error: any) {
        console.error('[Verifier Profile GET]', error);
        return NextResponse.json({ success: false, message: error.message ?? 'Internal server error' }, { status: 500 });
    }
}