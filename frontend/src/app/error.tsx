"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <main className="page-crash">
      <div className="page-crash-card">
        <span className="brand-mark">EF</span>
        <p className="eyebrow">ESTATEFLOW CRM</p>
        <h1>Something interrupted this workspace.</h1>
        <p>
          We could not finish loading this page. Your data is safe. Try the page
          again or return to the dashboard.
        </p>
        <div className="form-actions">
          <button className="text-button" type="button" onClick={reset}>
            Try again
          </button>
          <a className="primary-button form-submit" href="/dashboard">
            Go to dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
