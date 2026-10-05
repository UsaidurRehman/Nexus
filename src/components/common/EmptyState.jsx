export default function EmptyState({
  title = 'Nothing here yet',
  message = 'Content for this section has not been published.',
  action = null,
}) {
  return (
    <div className="nx-surface px-6 py-14 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/5">
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-nexus-lilac" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h10M4 17h7" />
        </svg>
      </div>
      <h3 className="font-display text-lg text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">{message}</p>
      {action}
    </div>
  );
}
