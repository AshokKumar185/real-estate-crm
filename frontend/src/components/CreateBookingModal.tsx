"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBooking, getLeads, getProperties } from "../lib/api";
import type { Lead, Project } from "../lib/types";
import { useAuth } from "./AuthProvider";
import { Modal } from "./Modal";
import { PageLoading } from "./PageStates";

export function CreateBookingModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const { token } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [leadId, setLeadId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (token)
      Promise.all([getLeads(token), getProperties(token)])
        .then(([nextLeads, nextProjects]) => {
          setLeads(nextLeads);
          setProjects(nextProjects);
        })
        .catch((reason: Error) => setError(reason.message));
  }, [token]);
  const units = projects
    .flatMap((project) =>
      project.buildings.flatMap((building) => building.units),
    )
    .filter((unit) => unit.status === "available");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      await createBooking(token, { leadId, unitId });
      onCreated();
      onClose();
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to create booking",
      );
    } finally {
      setSaving(false);
    }
  };
  if (!leads.length && !projects.length && !error)
    return (
      <Modal
        eyebrow="CONVERSIONS · NEW BOOKING"
        title="Reserve a property"
        onClose={onClose}
      >
        <PageLoading label="Loading available options..." />
      </Modal>
    );
  return (
    <Modal
      eyebrow="CONVERSIONS · NEW BOOKING"
      title="Reserve a property"
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <p className="form-intro">
          The server locks the unit during booking to prevent duplicate
          reservations.
        </p>
        <div className="form-grid">
          <label>
            Lead
            <select
              required
              value={leadId}
              onChange={(event) => setLeadId(event.target.value)}
            >
              <option value="">Select a lead</option>
              {leads
                .filter((lead) => lead.stage !== "lost")
                .map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Available unit
            <select
              required
              value={unitId}
              onChange={(event) => setUnitId(event.target.value)}
            >
              <option value="">Select a unit</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.unitNumber} · {unit.type} · ₹
                  {Number(unit.price).toLocaleString("en-IN")}
                </option>
              ))}
            </select>
          </label>
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="form-actions">
          <button className="text-button" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button form-submit" disabled={saving}>
            {saving ? "Confirming..." : "Confirm booking"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
