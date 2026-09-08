"use client";

import Link from "next/link";

export function PageHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: { label: string; href: string };
}) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      <div className="top-actions">
        {/* <button className="icon-button" aria-label="Notifications">
          ◌<i />
        </button> */}
        {action && (
          <Link className="outline-button" href={action.href}>
            {action.label}
          </Link>
        )}
      </div>
    </header>
  );
}
