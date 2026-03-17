// lib/auth.service.ts

import { Session } from 'next-auth';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    initials: string;
    role: string
    department?: string;
    avatar?: string;
}

export interface LoginResult {
    success: boolean;
    user?: AuthUser;
    token?: string;
    error?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// ─── Auth Service ────────────────────────────────────────────────────────────

export const AuthService = {
    /**
     * Credentials-based login.
     * Replace the mock block with a real fetch() call to your backend.
     */
    async login(credentials: LoginCredentials): Promise<LoginResult> {
        try {
            // ── MOCK (replace with real API call) ──────────────────────────────
            await new Promise(r => setTimeout(r, 1500)); // simulate network

            if (
                credentials.email === 'admin@iitrpr.ac.in' &&
                credentials.password === 'admin123'
            ) {
                const user: AuthUser = {
                    id: 'usr_001',
                    name: 'Admin User',
                    email: credentials.email,
                    initials: 'AU',
                    role: 'admin',
                    department: 'Administration',
                };
                return { success: true, user, token: 'mock_jwt_token_xyz' };
            }

            return { success: false, error: 'Invalid email or password' };

            // ── REAL API (uncomment when backend is ready) ─────────────────────
            // const res = await fetch('/api/auth/login', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(credentials),
            // });
            // if (!res.ok) {
            //   const err = await res.json();
            //   return { success: false, error: err.message ?? 'Login failed' };
            // }
            // const { user, token } = await res.json();
            // return { success: true, user, token };
        } catch {
            return { success: false, error: 'Network error. Please try again.' };
        }
    },

    /**
     * Map a NextAuth Google session to our AuthUser shape.
     * Call this after signIn("google") resolves.
     */
    mapGoogleSession(session: Session): AuthUser | null {
        if (!session?.user?.email) return null;
        const name = session.user.name ?? session.user.email;
        return {
            id: session.user.id ?? `google_${session.user.email}`,
            name,
            email: session.user.email,
            initials: getInitials(name),
            role: (session.user.role as AuthUser['role']) ?? 'admin',
            avatar: session.user.image ?? undefined,
        };
    },

    /**
     * Logout — clear token, call backend if needed.
     */
    async logout(): Promise<void> {
        // localStorage.removeItem('auth_token');
        // await fetch('/api/auth/logout', { method: 'POST' });
    },
};