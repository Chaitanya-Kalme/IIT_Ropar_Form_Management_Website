import { createContext, useContext, useState, type ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("auth") === "true";
  });
  const [user, setUser] = useState<{ name: string; email: string } | null>(() => {
    const stored = sessionStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, _password: string) => {
    // In production, this would call the real API
    setIsAuthenticated(true);
    const u = { name: "Dr. Rajesh Kumar", email };
    setUser(u);
    sessionStorage.setItem("auth", "true");
    sessionStorage.setItem("user", JSON.stringify(u));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    sessionStorage.removeItem("auth");
    sessionStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
