export function PageLoading({
  label = "Loading workspace...",
}: {
  label?: string;
}) {
  return (
    <div
      className="page-state loading-screen"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="loading-emblem" aria-hidden="true">
        <span className="loading-orbit" />
        <span className="loading-mark">EF</span>
      </div>
      <div className="loading-copy">
        <strong>Preparing your workspace</strong>
        <span>{label}</span>
      </div>
      <div className="loading-track" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}

export function PageError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="page-error">
      <strong>Something needs attention</strong>
      <span>{message}</span>
      {onRetry && (
        <button className="text-button" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function PageEmpty({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="page-state empty-state">
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
}
