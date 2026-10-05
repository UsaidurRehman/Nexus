/** Controlled search box. Filtering happens client-side over the loaded list. */
export default function EventSearch({ value, onChange, resultCount, totalCount }) {
  return (
    <div className="w-full max-w-md">
      <label htmlFor="event-search" className="sr-only">
        Search events
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m20 20-3.2-3.2" />
          </svg>
        </span>
        <input
          id="event-search"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search events, categories, venues…"
          autoComplete="off"
          className="w-full rounded-full border border-white/15 bg-white/[0.05] py-3.5 pl-12 pr-11 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-nexus-mint focus:outline-none focus:ring-2 focus:ring-nexus-mint/30"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        ) : null}
      </div>

      <p className="mt-2 pl-1 text-xs text-slate-500" role="status" aria-live="polite">
        {value
          ? `${resultCount} of ${totalCount} events match “${value}”`
          : `${totalCount} events across three tiers`}
      </p>
    </div>
  );
}
