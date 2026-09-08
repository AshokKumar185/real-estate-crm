"use client";

import { useEffect, type ReactNode } from "react";
import { useAuth } from "./AuthProvider";
import { AppShell } from "./AppShell";
import { PageLoading } from "./PageStates";

export function ProtectedLayout({ children }: { children: ReactNode }) {
  const { ready, user, logout } = useAuth();
  useEffect(() => {
    if (ready && !user) window.location.replace("/");
  }, [ready, user]);
  if (!ready || !user) return <PageLoading label="Checking your session..." />;
  return (
    <AppShell user={user} onLogout={logout}>
      {children}
    </AppShell>
  );
}
