import React, { createContext, useContext, useEffect, useState } from "react";
import { useListCustomers, useListWorkers } from "@workspace/api-client-react";

export type Role = "customer" | "worker" | "admin" | null;

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  actorId: number | null;
  setActorId: (id: number | null) => void;
  isReady: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>(null);
  const [actorId, setActorIdState] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem("verihire_role") as Role;
    const savedActorId = localStorage.getItem("verihire_actor_id");

    if (savedRole) setRoleState(savedRole);
    if (savedActorId) setActorIdState(parseInt(savedActorId, 10));
    
    setIsReady(true);
  }, []);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (newRole) {
      localStorage.setItem("verihire_role", newRole);
    } else {
      localStorage.removeItem("verihire_role");
    }
  };

  const setActorId = (id: number | null) => {
    setActorIdState(id);
    if (id !== null) {
      localStorage.setItem("verihire_actor_id", id.toString());
    } else {
      localStorage.removeItem("verihire_actor_id");
    }
  };

  return (
    <RoleContext.Provider value={{ role, setRole, actorId, setActorId, isReady }}>
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
