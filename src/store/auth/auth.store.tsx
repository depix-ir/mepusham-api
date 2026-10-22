"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { User, RequestOtpParams, VerifyOtpParams } from "@/types/auth";
import { authService } from "@/lib/auth/authService";

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  requestOtp: (params: RequestOtpParams) => Promise<{ success: boolean; message: string; cooldownSeconds?: number }>;
  verifyOtp: (params: VerifyOtpParams) => Promise<User>;
  updateProfile: (updates: { firstName: string; lastName: string }) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Restore session safely on client mount after hydration
  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (e) {
        console.error("Error loading current user:", e);
      } finally {
        setIsAuthLoading(false);
      }
    });
  }, []);

  const requestOtp = useCallback(async (params: RequestOtpParams) => {
    return await authService.requestOtp(params);
  }, []);

  const verifyOtp = useCallback(async (params: VerifyOtpParams) => {
    const verifiedUser = await authService.verifyOtp(params);
    setUser(verifiedUser);
    return verifiedUser;
  }, []);

  const updateProfile = useCallback(async (updates: { firstName: string; lastName: string }) => {
    const updatedUser = await authService.updateProfile(updates);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isAuthLoading,
      requestOtp,
      verifyOtp,
      updateProfile,
      logout,
    }),
    [user, isAuthLoading, requestOtp, verifyOtp, updateProfile, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
