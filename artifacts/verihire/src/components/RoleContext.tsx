import React, { createContext, useContext, useEffect, useState } from "react";

export type Role = "customer" | "worker" | "admin" | null;

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "customer" | "worker";
}

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  user: AuthUser | null;
  isAuthenticated: boolean;
  actorId: number | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  isReady: boolean;
}

const SESSION_KEY = "kw_session_v2";

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed: AuthUser = JSON.parse(raw);
        if (parsed.id && parsed.name && parsed.email && parsed.role) {
          setUser(parsed);
          setRoleState(parsed.role);
        }
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
    setIsReady(true);
  }, []);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
  };

  const login = (u: AuthUser) => {
    setUser(u);
    setRoleState(u.role);
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    setRoleState(null);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("kw_admin_auth");
  };

  const actorId = user?.id ?? null;
  const isAuthenticated = user !== null;

  return (
    <RoleContext.Provider value={{ role, setRole, user, isAuthenticated, actorId, login, logout, isReady }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
