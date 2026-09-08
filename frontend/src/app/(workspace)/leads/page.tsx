"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../components/AuthProvider";
import { CreateLeadModal } from "../../../components/CreateLeadModal";
import { LeadsView } from "../../../components/DataViews";
import { PageError, PageLoading } from "../../../components/PageStates";
import { PageHeader } from "../../../components/PageHeader";
import { getLeads } from "../../../lib/api";
import type { Lead } from "../../../lib/types";

export default function LeadsPage() {
  const { token } = useAuth();
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const loadLeads = () => {
    if (token)
      getLeads(token)
        .then(setLeads)
        .catch((reason: Error) => setError(reason.message));
  };
  useEffect(loadLeads, [token]);
  return (
    <>
      {error ? (
        <PageError message={error} onRetry={loadLeads} />
      ) : !leads ? (
        <PageLoading label="Loading leads..." />
      ) : (
        <>
          <PageHeader
            eyebrow="PIPELINE"
            title="Lead management"
            action={undefined}
          />
          <div className="page-actions crm-toolbar">
            <div className="toolbar-summary">
              <div className="summary-metric blue">
                <span className="metric-label">Total leads</span>
                <strong>{leads.length}</strong>
                <span className="metric-dot" aria-hidden="true" />
              </div>
              <div className="summary-metric coral">
                <span className="metric-label">Follow-ups</span>
                <strong>
                  {leads.filter((lead) => lead.followUpDate).length}
                </strong>
                <span className="metric-dot" aria-hidden="true" />
              </div>
              <div className="summary-metric gold">
                <span className="metric-label">Booked</span>
                <strong>
                  {leads.filter((lead) => lead.stage === "booked").length}
                </strong>
                <span className="metric-dot" aria-hidden="true" />
              </div>
            </div>
            <button
              className="outline-button"
              onClick={() => setShowCreate(true)}
            >
              + Add lead
            </button>
          </div>
          <LeadsView leads={leads} />
          {showCreate && (
            <CreateLeadModal
              onClose={() => setShowCreate(false)}
              onCreated={loadLeads}
            />
          )}
        </>
      )}
    </>
  );
}
