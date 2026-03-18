'use client';

import React, {
    createContext, useContext, useState,
    useEffect, useMemo, useCallback,
} from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { AuthService, AuthUser } from '@/lib/auth.service';

interface AppContextType {
    currentUser: AuthUser | null;
    authStatus: 'loading' | 'authenticated' | 'unauthenticated';
    isLoggedIn: boolean;
    logout: () => Promise<void>;
    darkMode: boolean;
    toggleDarkMode: () => void;
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (v: boolean) => void;
    notifications: number;
}

const AppContext = createContext<AppContextType | null>(null);

function AppProviderInner({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();

    const currentUser = useMemo<AuthUser | null>(() => {
        if (status === 'loading') return null;
        if (status === 'unauthenticated' || !session) return null;

        // Fallback portal to 'admin' during hydration
        const hydratedSession = {
            ...session,
            user: {
                ...session.user,
                portal: session.user.portal ?? 'admin',
            },
        };

        return AuthService.mapSession(hydratedSession);
    }, [
        status,
        session?.user?.email,
        session?.user?.role,
        session?.user?.portal,
    ]);

    const isLoggedIn = status === 'authenticated' && currentUser !== null;

    const [darkMode, setDarkMode] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const notifications = 5;

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);

    const toggleDarkMode = useCallback(() => setDarkMode(prev => !prev), []);

    const logout = useCallback(async () => {
        await AuthService.logout();
    }, []);

    const value = useMemo<AppContextType>(
        () => ({
            currentUser,
            authStatus: status,
            isLoggedIn,
            logout,
            darkMode,
            toggleDarkMode,
            sidebarCollapsed,
            setSidebarCollapsed,
            notifications,
        }),
        [currentUser, status, isLoggedIn, logout, darkMode, toggleDarkMode, sidebarCollapsed]
    );

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AppProviderInner>{children}</AppProviderInner>
        </SessionProvider>
    );
}

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within <AppProvider>');
    return context;
};