"use client";

import { useEffect } from "react";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="page-crash workspace-crash">
      <div className="page-crash-card">
        <p className="eyebrow">WORKSPACE ERROR</p>
        <h1>We could not load this view.</h1>
        <p>Try again, or return to the dashboard and continue working.</p>
        <div className="form-actions">
          <button className="text-button" type="button" onClick={reset}>
            Try again
          </button>
          <a className="primary-button form-submit" href="/dashboard">
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}