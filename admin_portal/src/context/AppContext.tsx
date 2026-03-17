'use client';

import React, {
  createContext, useContext, useState,
  useEffect, useMemo, useCallback,
} from 'react';
import { SessionProvider, useSession, signOut } from 'next-auth/react';
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

  // Derive user entirely from NextAuth session — no manual state
  const currentUser = useMemo<AuthUser | null>(() => {
    if (status !== 'authenticated' || !session?.user?.email) return null;
    return AuthService.mapGoogleSession(session);
  }, [session, status]);

  const isLoggedIn = status === 'authenticated' && currentUser !== null;

  // UI preferences only — these are not auth-related
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const notifications = 5;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => setDarkMode(prev => !prev), []);

  const logout = useCallback(async () => {
    await signOut({ callbackUrl: '/login' });
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