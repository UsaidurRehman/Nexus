import EventGrid from './EventGrid.jsx';
import SectionTitle from '../common/SectionTitle.jsx';
import { getTierPresentation } from '../../config.js';

/**
 * One tier block on the Events page. A tier with zero matching events renders
 * nothing at all (agreed edge-case rule) unless `showEmpty` is set.
 */
export default function TierSection({ tier, events, showEmpty = false }) {
  const presentation = getTierPresentation(tier.tierLevel);
  if (!events.length && !showEmpty) return null;

  return (
    <section id={`tier-${tier.tierLevel}`} className="scroll-mt-28" aria-labelledby={`tier-${tier.tierLevel}-heading`}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <SectionTitle
          id={`tier-${tier.tierLevel}-heading`}
          eyebrow={presentation.label}
          title={tier.name}
          description={tier.description}
        />
        <span className="nx-chip shrink-0">
          {events.length} {events.length === 1 ? 'event' : 'events'}
        </span>
      </div>

      <div
        className="mb-9 h-px w-full"
        style={{ background: `linear-gradient(90deg, ${presentation.accent} 0%, ${presentation.accent}33 28%, transparent 70%)` }}
        aria-hidden="true"
      />

      {events.length ? (
        <EventGrid events={events} variant={presentation.variant} />
      ) : (
        <p className="nx-surface px-6 py-10 text-center text-sm text-slate-400">
          No events published in this tier yet.
        </p>
      )}
    </section>
  );
}
