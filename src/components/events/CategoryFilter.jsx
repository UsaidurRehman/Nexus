/**
 * Category filter chips for the public catalog.
 * Pure presentation — the selected slug is lifted to the Events page,
 * which passes it to the API through the data hooks.
 */
export default function CategoryFilter({ categories = [], value = '', onChange, counts = {} }) {
  if (categories.length === 0) return null;

  const chips = [{ categoryId: 'all', slug: '', name: 'All events' }, ...categories];

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter events by category">
      {chips.map((category) => {
        const isActive = value === category.slug;
        const count = category.slug ? counts[category.slug] : undefined;

        return (
          <button
            key={category.categoryId}
            type="button"
            onClick={() => onChange(category.slug)}
            aria-pressed={isActive}
            className={[
              'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition',
              isActive
                ? 'border-nexus-mint/50 bg-nexus-mint/15 text-nexus-mint'
                : 'border-white/12 bg-white/[0.03] text-slate-300 hover:border-white/25 hover:text-white',
            ].join(' ')}
          >
            {category.name}
            {count !== undefined && count > 0 ? (
              <span
                className={[
                  'rounded-full px-1.5 py-0.5 text-[11px] tabular-nums',
                  isActive ? 'bg-nexus-mint/20' : 'bg-white/8 text-slate-400',
                ].join(' ')}
              >
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
