"use client";

import React from "react";
import { useAuth } from "@/store/auth/auth.store";
import { AccountAuth } from "@/components/account/auth/AccountAuth";
import { AccountDashboard } from "@/components/account/AccountDashboard";
import { Container } from "@/components/ui/Container";

export default function AccountPage() {
  const { user, isAuthenticated, isAuthLoading, updateProfile, logout } = useAuth();

  // Show clean lightweight loading state until auth hydration is resolved
  if (isAuthLoading) {
    return (
      <div className="py-20 min-h-[60vh] flex items-center justify-center">
        <Container className="max-w-md mx-auto text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-3 border-primary/30 border-t-primary animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground animate-pulse">
            در حال بازیابی حساب کاربری...
          </p>
        </Container>
      </div>
    );
  }

  // State A — Unauthenticated
  if (!isAuthenticated || !user) {
    return <AccountAuth />;
  }

  // State B — Authenticated Dashboard
  return (
    <AccountDashboard
      user={user}
      onUpdateProfile={updateProfile}
      onLogout={logout}
    />
  );
}
