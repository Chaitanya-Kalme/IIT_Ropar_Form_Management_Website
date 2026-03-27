"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useSession, signOut } from "next-auth/react";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { name: string; email: string; role: string } | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const isAuthenticated = status === "authenticated";

  const user = session?.user
    ? {
      name: session.user.name ?? "Unknown",
      email: session.user.email ?? "",
      role: session.user.role ?? "User",   // injected by your jwt callback
    }
    : null;

  const logout = () => {
    signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}