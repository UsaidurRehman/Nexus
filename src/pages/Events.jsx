import { useEffect, useMemo, useState } from 'react';
import Seo from '../components/common/Seo.jsx';
import AsyncBoundary from '../components/common/AsyncBoundary.jsx';
import { EventGridSkeleton } from '../components/common/Skeletons.jsx';
import TierSection from '../components/events/TierSection.jsx';
import EventSearch from '../components/events/EventSearch.jsx';
import TierJumpLinks from '../components/events/TierJumpLinks.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import CategoryFilter from '../components/events/CategoryFilter.jsx';
import { useCategories, useEvents, useTiers } from '../hooks/useFestData.js';
import { FEATURES, SITE } from '../config.js';

/** Debounce so typing does not re-filter on every keystroke. */
function useDebounced(value, delay = 180) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function Events() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const debouncedSearch = useDebounced(search);

  // ONE request for the whole list; tiers are grouped client-side.
  // The category filter is applied SERVER-side so counts stay honest.
  const eventsQuery = useEvents(category ? { category } : {});
  const tiersQuery = useTiers();
  const categoriesQuery = useCategories();

  const events = eventsQuery.data || [];
  const tiers = tiersQuery.data || [];
  const categories = categoriesQuery.data || [];

  // Category totals come straight from the API's event counts.
  const categoryCounts = useMemo(
    () =>
      Object.fromEntries(categories.map((item) => [item.slug, item.eventCount])),
    [categories],
  );

  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return events;
    return events.filter((event) =>
      [event.title, event.shortSummary, event.categoryName, event.venue, event.description]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term)),
    );
  }, [events, debouncedSearch]);

  const byTier = useMemo(() => {
    const map = {};
    tiers.forEach((tier) => {
      map[tier.tierLevel] = filtered.filter((event) => event.tierLevel === tier.tierLevel);
    });
    return map;
  }, [filtered, tiers]);

  const counts = useMemo(
    () => Object.fromEntries(Object.entries(byTier).map(([level, list]) => [level, list.length])),
    [byTier],
  );

  const isLoading = eventsQuery.isLoading || tiersQuery.isLoading;
  const isError = eventsQuery.isError || tiersQuery.isError;
  const error = eventsQuery.error || tiersQuery.error;

  const retry = () => {
    eventsQuery.refetch();
    tiersQuery.refetch();
    categoriesQuery.refetch();
  };

  return (
    <>
      <Seo
        title="Events"
        description={SITE.DEFAULT_DESCRIPTION}
        path="/events"
      />

      {/* Page header */}
      <section className="relative overflow-hidden border-b border-white/8 pb-14 pt-32 sm:pt-36">
        <div className="nx-glow absolute inset-0 opacity-80" aria-hidden="true" />
        <div className="nx-grid-bg absolute inset-0 opacity-25" aria-hidden="true" />
        <div className="nx-container relative">
          <span className="nx-chip">Competitions</span>
          <h1 className="mt-5 font-display text-[clamp(2.6rem,7vw,4.75rem)] leading-[0.92] tracking-tightest">
            <span className="nx-gradient-text">Events</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Every competition at Nexus, grouped by tier. Tier 1 are the flagship, long-format
            contests; Tier 3 are quick-fire events you can enter on the day.
          </p>

          {FEATURES.CATEGORY_FILTER && categories.length > 0 ? (
            <div className="mt-8">
              <CategoryFilter
                categories={categories}
                value={category}
                onChange={setCategory}
                counts={categoryCounts}
              />
            </div>
          ) : null}

          <div className="mt-9 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            {FEATURES.EVENT_SEARCH ? (
              <EventSearch
                value={search}
                onChange={setSearch}
                resultCount={filtered.length}
                totalCount={events.length}
              />
            ) : (
              <span />
            )}
            {FEATURES.TIER_JUMP_LINKS && !isLoading ? (
              <TierJumpLinks tiers={tiers} counts={counts} />
            ) : null}
          </div>
        </div>
      </section>

      {/* Tier sections */}
      <div className="nx-container space-y-20 py-16 sm:space-y-24 sm:py-20">
        <AsyncBoundary
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={retry}
          skeleton={
            <div className="space-y-16">
              <EventGridSkeleton count={3} variant="large" />
              <EventGridSkeleton count={3} variant="medium" />
            </div>
          }
        >
          {filtered.length === 0 ? (
            <EmptyState
              title={debouncedSearch || category ? 'No matching events' : 'No events published yet'}
              message={
                debouncedSearch
                  ? `Nothing matches “${debouncedSearch}”. Try a shorter or different term.`
                  : category
                    ? 'This category has no published events yet.'
                    : 'The line-up is being finalised. Check back shortly.'
              }
              action={
                debouncedSearch || category ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setCategory('');
                    }}
                    className="nx-btn-ghost mt-7"
                  >
                    Clear filters
                  </button>
                ) : null
              }
            />
          ) : (
            tiers.map((tier) => (
              <TierSection key={tier.tierId} tier={tier} events={byTier[tier.tierLevel] || []} />
            ))
          )}
        </AsyncBoundary>
      </div>
    </>
  );
}
