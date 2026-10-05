/** Friendly, non-technical failure panel. Never shows a stack trace. */
export default function ErrorState({ error, onRetry, title = 'Something went wrong' }) {
  const message = error?.message || 'An unexpected error occurred.';
  return (
    <div
      role="alert"
      className="nx-surface mx-auto max-w-xl px-6 py-12 text-center"
    >
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-rose-400/40 bg-rose-500/10">
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-rose-300" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path strokeLinecap="round" d="M12 8v5M12 16.5h.01" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      </div>
      <h2 className="font-display text-xl text-white">{title}</h2>
      <p className="mt-2 text-sm text-slate-400">{message}</p>
      {error?.detail ? (
        <p className="mt-1 text-xs text-slate-500">{error.detail}</p>
      ) : null}
      {onRetry ? (
        <button type="button" onClick={onRetry} className="nx-btn-ghost mt-7">
          Try again
        </button>
      ) : null}
    </div>
  );
}
