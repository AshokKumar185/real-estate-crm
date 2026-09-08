"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../components/AuthProvider";
import { CreatePropertyModal } from "../../../components/CreatePropertyModal";
import { PropertiesView } from "../../../components/DataViews";
import { PageError, PageLoading } from "../../../components/PageStates";
import { PageHeader } from "../../../components/PageHeader";
import { getProperties } from "../../../lib/api";
import type { Project } from "../../../lib/types";

export default function PropertiesPage() {
  const { token, user } = useAuth();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const buildingCount =
    projects?.reduce((total, project) => total + project.buildings.length, 0) ??
    0;
  const units =
    projects?.flatMap((project) =>
      project.buildings.flatMap((building) => building.units),
    ) ?? [];
  const loadProperties = () => {
    if (token)
      getProperties(token)
        .then(setProjects)
        .catch((reason: Error) => setError(reason.message));
  };
  useEffect(loadProperties, [token]);
  return (
    <>
      {error ? (
        <PageError message={error} onRetry={loadProperties} />
      ) : !projects ? (
        <PageLoading label="Loading properties..." />
      ) : (
        <>
          <PageHeader eyebrow="INVENTORY" title="Property management" />
          <div className="page-actions crm-toolbar">
            <div className="toolbar-summary">
              <div className="summary-metric blue">
                <span className="metric-label">Projects</span>
                <strong>{projects.length}</strong>
                <span className="metric-dot" aria-hidden="true" />
              </div>
              <div className="summary-metric coral">
                <span className="metric-label">Buildings</span>
                <strong>{buildingCount}</strong>
                <span className="metric-dot" aria-hidden="true" />
              </div>
              <div className="summary-metric gold">
                <span className="metric-label">Units</span>
                <strong>{units.length}</strong>
                <span className="metric-dot" aria-hidden="true" />
              </div>
              <div className="summary-metric mint">
                <span className="metric-label">Available</span>
                <strong>
                  {units.filter((unit) => unit.status === "available").length}
                </strong>
                <span className="metric-dot" aria-hidden="true" />
              </div>
            </div>
            {user?.role === "admin" && (
              <button
                className="outline-button"
                onClick={() => setShowCreate(true)}
              >
                + Add property
              </button>
            )}
          </div>
          <PropertiesView projects={projects} />
          {showCreate && (
            <CreatePropertyModal
              projects={projects}
              onClose={() => setShowCreate(false)}
              onCreated={loadProperties}
            />
          )}
        </>
      )}
    </>
  );
}
