import { Session } from 'next-auth';
import { signIn, signOut } from 'next-auth/react';

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    initials: string;
    role: string;
    portal: string;
    department?: string;
    avatar?: string;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export const AuthService = {
    // No state/portal param needed — this is admin portal only
    async loginWithGoogle(): Promise<void> {
        await signIn('google', {
            callbackUrl: '/dashboard',
        });
    },

    mapSession(session: Session): AuthUser | null {
        if (!session?.user?.email) return null;

        const { id, name, email, image, role, portal } = session.user;

        // Strictly enforce admin portal and admin role
        if (portal !== 'admin') {
            console.error(`[AdminPortal] Portal mismatch: expected 'admin', got '${portal}'`);
            return null;
        }

        if (role !== 'admin') {
            console.error(`[AdminPortal] Role check failed: expected 'admin', got '${role}'`);
            return null;
        }

        const resolvedName = name ?? email;

        return {
            id: id ?? `google_${email}`,
            name: resolvedName,
            email,
            initials: getInitials(resolvedName),
            role: 'admin',
            portal: 'admin',
            avatar: image ?? undefined,
        };
    },

    async logout(): Promise<void> {
        await signOut({ callbackUrl: '/login' });
    },
};