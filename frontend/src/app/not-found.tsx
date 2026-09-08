import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <div className="brand-mark">EF</div>
      <p className="eyebrow">404 · PAGE NOT FOUND</p>
      <h1>That workspace view moved.</h1>
      <p>Return to your dashboard and continue where you left off.</p>
      <Link className="outline-button" href="/dashboard">
        Back to dashboard
      </Link>
    </main>
  );
}
