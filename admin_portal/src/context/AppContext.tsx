'use client';

import { SessionProvider } from 'next-auth/react';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  currentUser: { name: string; email: string; initials: string };
  notifications: number;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const currentUser = {
    name: 'Admin User',
    email: 'admin@iitrpr.ac.in',
    initials: 'AU',
  };

  const notifications = 5;

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        darkMode,
        toggleDarkMode,
        sidebarCollapsed,
        setSidebarCollapsed,
        currentUser,
        notifications,
      }}
    >
      <SessionProvider>
        {children}

      </SessionProvider>
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within <AppProvider>');
  }
  return context;
};
