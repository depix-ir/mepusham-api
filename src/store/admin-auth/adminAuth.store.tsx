"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  AdminLoginCredentials,
  AdminPermission,
  AdminSession,
  AdminUser,
} from "@/types/adminAuth";
import { adminAuthService } from "@/lib/admin-auth";

interface AdminAuthContextType {
  admin: AdminUser | null;
  session: AdminSession | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoading: boolean;
  login: (credentials: AdminLoginCredentials) => Promise<AdminSession>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<AdminSession | null>;
  hasPermission: (permission: AdminPermission) => boolean;
  canAccessRoute: (pathname: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async (): Promise<AdminSession | null> => {
    setIsLoading(true);
    try {
      const activeSession = await adminAuthService.getSession();
      if (activeSession) {
        setSession(activeSession);
        setAdmin(activeSession.user);
      } else {
        setSession(null);
        setAdmin(null);
      }
      return activeSession;
    } catch (e) {
      console.error("Error refreshing admin session:", e);
      setSession(null);
      setAdmin(null);
      return null;
    } finally {
      setIsLoading(false);
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    // Initial client hydration phase
    let isMounted = true;
    Promise.resolve().then(async () => {
      const activeSession = await adminAuthService.getSession();
      if (!isMounted) return;
      if (activeSession) {
        setSession(activeSession);
        setAdmin(activeSession.user);
      } else {
        setSession(null);
        setAdmin(null);
      }
      setIsLoading(false);
      setIsHydrated(true);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials: AdminLoginCredentials): Promise<AdminSession> => {
    setIsLoading(true);
    try {
      const newSession = await adminAuthService.login(credentials);
      setSession(newSession);
      setAdmin(newSession.user);
      return newSession;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await adminAuthService.logout();
      setSession(null);
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = useCallback(
    (permission: AdminPermission): boolean => {
      return adminAuthService.hasPermission(admin, permission);
    },
    [admin]
  );

  const canAccessRoute = useCallback(
    (pathname: string): boolean => {
      return adminAuthService.canAccessRoute(admin, pathname);
    },
    [admin]
  );

  const value: AdminAuthContextType = {
    admin,
    session,
    isAuthenticated: !!admin && !!session && admin.isActive,
    isHydrated,
    isLoading,
    login,
    logout,
    refreshSession,
    hasPermission,
    canAccessRoute,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
