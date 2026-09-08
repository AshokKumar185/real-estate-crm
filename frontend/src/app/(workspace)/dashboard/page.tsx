"use client";

import { useEffect, useState } from "react";
import { DashboardView } from "../../../components/DashboardView";
import { PageError, PageLoading } from "../../../components/PageStates";
import { PageHeader } from "../../../components/PageHeader";
import { getDashboard, getLeads } from "../../../lib/api";
import type { Dashboard, Lead } from "../../../lib/types";
import { useAuth } from "../../../components/AuthProvider";

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!token) return;
    Promise.all([getDashboard(token), getLeads(token)])
      .then(([summary, nextLeads]) => {
        setDashboard(summary);
        setLeads(nextLeads);
      })
      .catch((reason: Error) => setError(reason.message));
  }, [token]);
  if (error)
    return (
      <>
        <PageHeader eyebrow="OVERVIEW" title="Your workspace" />
        <PageError message={error} />
      </>
    );
  if (!dashboard) return <PageLoading />;
  return (
    <>
      <PageHeader
        eyebrow={`TUESDAY, SEPTEMBER 08, 2026 · ${user?.role === "admin" ? "ADMIN" : "SALES"}`}
        title={`Good morning, ${user?.name.split(" ")[0]}`}
        action={{ label: "+ Add lead", href: "/leads/new" }}
      />
      <DashboardView
        dashboard={dashboard}
        leads={leads}
        onLeads={() => window.location.assign("/leads")}
      />
    </>
  );
}
