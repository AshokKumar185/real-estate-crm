"use client";

import Link from "next/link";
import { useState } from "react";
import type { Booking, Lead, Project } from "../lib/types";

const stageLabels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  site_visit: "Site visit",
  interested: "Interested",
  negotiation: "Negotiation",
  booked: "Booked",
  lost: "Lost",
};

export function LeadsView({ leads }: { leads: Lead[] }) {
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("all");
  const filteredLeads = leads.filter(
    (lead) =>
      `${lead.name} ${lead.phone}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (stage === "all" || lead.stage === stage),
  );
  return (
    <section className="panel table-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">PIPELINE</p>
          <h2>
            All leads <span className="count-chip">{filteredLeads.length}</span>
          </h2>
        </div>
        <div className="filter-row">
          <input
            className="search-input"
            placeholder="Search name or phone"
            aria-label="Search leads"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            className="stage-filter"
            aria-label="Filter by stage"
            value={stage}
            onChange={(event) => setStage(event.target.value)}
          >
            <option value="all">All stages</option>
            {Object.entries(stageLabels).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="table-head">
        <span>Lead</span>
        <span>Stage</span>
        <span>Follow-up</span>
      </div>
      <div className="data-list">
        {filteredLeads.map((lead) => (
          <Link
            className="data-row lead-row"
            href={`/leads/${lead.id}`}
            key={lead.id}
          >
            <span className="row-avatar">{lead.name[0]}</span>
            <span className="row-copy">
              <strong>{lead.name}</strong>
              <small>{lead.phone}</small>
            </span>
            <span className="badge">
              {stageLabels[lead.stage] ?? lead.stage}
            </span>
            <span className="row-date">
              {lead.followUpDate
                ? new Date(lead.followUpDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })
                : "No date"}
            </span>
            <span className="row-arrow">→</span>
          </Link>
        ))}
        {!filteredLeads.length && (
          <div className="empty-state">No leads match your filters.</div>
        )}
      </div>
    </section>
  );
}

export function PropertiesView({ projects }: { projects: Project[] }) {
  const units = projects.flatMap((project) =>
    project.buildings.flatMap((building) =>
      building.units.map((unit) => ({
        ...unit,
        project: project.name,
        building: building.name,
      })),
    ),
  );
  return (
    <section className="panel table-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">INVENTORY</p>
          <h2>
            Available homes <span className="count-chip">{units.length}</span>
          </h2>
        </div>
        <span className="inventory-summary">
          <b>{units.filter((unit) => unit.status === "available").length}</b>{" "}
          available
        </span>
      </div>
      <div className="table-head property-head">
        <span>Unit</span>
        <span>Configuration</span>
        <span>Price</span>
        <span>Status</span>
      </div>
      <div className="data-list">
        {units.map((unit) => (
          <div className="data-row property-row" key={unit.id}>
            <span className="row-copy">
              <strong>{unit.unitNumber}</strong>
              <small>
                {unit.project} · {unit.building}
              </small>
            </span>
            <span className="unit-type">{unit.type}</span>
            <strong className="unit-price">
              ₹{Number(unit.price).toLocaleString("en-IN")}
            </strong>
            <span className={`badge ${unit.status}`}>{unit.status}</span>
          </div>
        ))}
        {!units.length && (
          <div className="empty-state">No properties available.</div>
        )}
      </div>
    </section>
  );
}

export function BookingsView({ bookings }: { bookings: Booking[] }) {
  return (
    <section className="panel table-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">CONVERSIONS</p>
          <h2>
            Property bookings{" "}
            <span className="count-chip">{bookings.length}</span>
          </h2>
        </div>
        <span className="inventory-summary">
          <b>{bookings.length}</b> confirmed
        </span>
      </div>
      <div className="table-head booking-head">
        <span>Customer</span>
        <span>Unit</span>
        <span>Booked on</span>
        <span>Status</span>
      </div>
      <div className="data-list">
        {bookings.map((booking) => (
          <div className="data-row booking-row" key={booking.id}>
            <span className="row-avatar booking-avatar">
              {(booking.lead?.name ?? "L")[0]}
            </span>
            <span className="row-copy">
              <strong>{booking.lead?.name ?? "Lead"}</strong>
              <small>Confirmed reservation</small>
            </span>
            <span className="unit-type">
              {booking.unit?.unitNumber} · {booking.unit?.type}
            </span>
            <span className="row-date">
              {new Date(booking.bookedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="badge booked">Confirmed</span>
          </div>
        ))}
        {!bookings.length && (
          <div className="empty-state">No confirmed bookings yet.</div>
        )}
      </div>
    </section>
  );
}
