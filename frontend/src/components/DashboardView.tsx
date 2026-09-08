"use client";

import Link from "next/link";
import type { Dashboard, Lead } from "../lib/types";

const stages = [
  "new",
  "contacted",
  "site_visit",
  "interested",
  "negotiation",
  "booked",
  "lost",
];
const stageLabels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  site_visit: "Site visit",
  interested: "Interested",
  negotiation: "Negotiation",
  booked: "Booked",
  lost: "Lost",
};

export function DashboardView({
  dashboard,
  leads,
  onLeads,
}: {
  dashboard: Dashboard | null;
  leads: Lead[];
  onLeads: () => void;
}) {
  const stats = [
    [
      "Active leads",
      dashboard?.leadCount ?? "—",
      "Across your pipeline",
      "blue",
      "01",
    ],
    [
      "Follow-ups due",
      dashboard?.followUpCount ?? "—",
      "Next 7 days",
      "coral",
      "02",
    ],
    [
      "Available units",
      dashboard?.availableUnits ?? "—",
      "Ready to show",
      "mint",
      "03",
    ],
    [
      "Confirmed bookings",
      dashboard?.bookingCount ?? "—",
      `${dashboard?.bookedUnits ?? 0} units occupied`,
      "gold",
      "04",
    ],
  ];
  const stageCount = (stage: string) =>
    Number(
      dashboard?.stageCounts.find((item) => item.stage === stage)?.count ?? 0,
    );
  const upcoming = leads.filter((lead) => lead.followUpDate).slice(0, 4);
  return (
    <>
      <div className="welcome-strip">
        <div>
          <p className="eyebrow">TODAY'S FOCUS</p>
          <h2>Keep the warm conversations moving.</h2>
          <p>Four touchpoints are ready for your team this week.</p>
        </div>
        <Link className="strip-link" href="/leads">
          Open pipeline <span>→</span>
        </Link>
      </div>
      <div className="stat-grid">
        {stats.map(([label, value, detail, tone, number]) => (
          <div className={`stat-card ${tone}`} key={label}>
            <div className="stat-top">
              <span className="stat-number">{number}</span>
              <span className="stat-icon">◆</span>
            </div>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{detail}</span>
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel pipeline-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">PIPELINE HEALTH</p>
              <h2>Lead momentum</h2>
              <span className="panel-subtitle">
                A snapshot of where opportunities are moving.
              </span>
            </div>
            <button className="text-button" onClick={onLeads}>
              View all <span>→</span>
            </button>
          </div>
          <div className="bar-chart">
            {stages.map((stage) => (
              <div className="bar-wrap" key={stage}>
                <strong>{stageCount(stage) || ""}</strong>
                <div
                  className="bar"
                  style={{ height: `${Math.max(stageCount(stage) * 18, 5)}px` }}
                />
                <span>{stageLabels[stage]}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="panel followup-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">FOLLOW-UP RADAR</p>
              <h2>Next conversations</h2>
            </div>
            <button className="text-button" onClick={onLeads}>
              See all <span>→</span>
            </button>
          </div>
          <div className="data-list">
            {upcoming.map((lead) => (
              <Link
                href={`/leads/${lead.id}`}
                className="data-row"
                key={lead.id}
              >
                <span className="row-avatar">{lead.name[0]}</span>
                <span className="row-copy">
                  <strong>{lead.name}</strong>
                  <small>
                    {new Date(lead.followUpDate!).toLocaleDateString(
                      undefined,
                      { month: "short", day: "numeric" },
                    )}
                  </small>
                </span>
                <span className="badge">
                  {stageLabels[lead.stage] ?? lead.stage}
                </span>
              </Link>
            ))}
            {!upcoming.length && (
              <div className="empty-state">No upcoming follow-ups.</div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
