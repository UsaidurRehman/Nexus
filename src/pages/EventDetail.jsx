import { Link, useParams } from 'react-router-dom';
import Seo from '../components/common/Seo.jsx';
import AsyncBoundary from '../components/common/AsyncBoundary.jsx';
import { DetailSkeleton } from '../components/common/Skeletons.jsx';
import EventGrid from '../components/events/EventGrid.jsx';
import SectionTitle from '../components/common/SectionTitle.jsx';
import { MonogramArt } from '../components/events/EventCard.jsx';
import RegisterButton from '../components/events/RegisterButton.jsx';
import NotFound from './NotFound.jsx';
import { useEvent, useEvents } from '../hooks/useFestData.js';
import {
  BOOKLET,
  FEATURES,
  ROUTES,
  formatEntryFee,
  formatOrHide,
  formatTeamSize,
  getTierPresentation,
} from '../config.js';

/** Renders nothing when there is no value — unconfirmed fields stay hidden. */
function FactRow({ label, value, highlight = false }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-5 border-b border-white/8 py-3.5 last:border-b-0">
      <dt className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </dt>
      <dd
        className={`text-right text-sm font-semibold ${
          highlight ? 'text-nexus-mint' : 'text-slate-200'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

export default function EventDetail() {
  const { slug } = useParams();
  const eventQuery = useEvent(slug);
  const allEventsQuery = useEvents();

  const event = eventQuery.data;

  // A 404 from the API renders the real NotFound page, not an error panel.
  if (eventQuery.isError && eventQuery.error?.isNotFound) {
    return <NotFound />;
  }

  const presentation = getTierPresentation(event?.tierLevel);

  // "More from this tier" — same tier, excluding the current event.
  const related = (allEventsQuery.data || [])
    .filter((item) => item.tierLevel === event?.tierLevel && item.slug !== event?.slug)
    .slice(0, 3);

  return (
    <>
      {event ? (
        <Seo
          title={event.title}
          description={event.shortSummary || event.description?.slice(0, 160)}
          image={event.imageUrl}
          path={ROUTES.EVENT_DETAIL(event.slug)}
          type="article"
        />
      ) : (
        <Seo title="Event" path={ROUTES.EVENT_DETAIL(slug || '')} />
      )}

      <AsyncBoundary
        isLoading={eventQuery.isLoading}
        isError={eventQuery.isError}
        error={eventQuery.error}
        onRetry={eventQuery.refetch}
        skeleton={
          <div className="nx-container pb-20 pt-32">
            <DetailSkeleton />
          </div>
        }
      >
        {event ? (
          <>
            {/* ---------- Banner ---------- */}
            <section className="relative h-[46vh] min-h-[320px] w-full overflow-hidden sm:h-[56vh]">
              {event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="h-full w-full object-cover"
                  fetchpriority="high"
                  decoding="async"
                />
              ) : (
                <MonogramArt title={event.title} tierLevel={event.tierLevel} className="h-full w-full" />
              )}
              <div
                className="absolute inset-0 bg-gradient-to-t from-nexus-ink via-nexus-ink/70 to-nexus-ink/35"
                aria-hidden="true"
              />

              <div className="nx-container absolute inset-x-0 bottom-0 pb-9">
                <Link
                  to={ROUTES.EVENTS}
                  className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-300 transition-colors hover:text-nexus-mint"
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H6M11 6l-6 6 6 6" />
                  </svg>
                  All events
                </Link>

                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-nexus-ink"
                    style={{ backgroundColor: presentation.accent }}
                  >
                    {event.tierName || `Tier ${event.tierLevel}`}
                  </span>
                  {event.category ? <span className="nx-chip">{event.category}</span> : null}
                  {event.isFeatured ? <span className="nx-chip">Featured</span> : null}
                </div>

                <h1 className="mt-4 max-w-4xl font-display text-[clamp(2rem,6vw,3.75rem)] leading-[0.98] text-white">
                  {event.title}
                </h1>
                {event.shortSummary ? (
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                    {event.shortSummary}
                  </p>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-3">
                  <RegisterButton eventTitle={event.title} />
                  {FEATURES.BOOKLET_LINK ? (
                    <a
                      href={BOOKLET.URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nx-btn nx-btn-ghost"
                    >
                      {BOOKLET.LABEL}
                    </a>
                  ) : null}
                </div>
              </div>
            </section>

            {/* ---------- Body ---------- */}
            <div className="nx-container grid gap-10 py-14 lg:grid-cols-[1.75fr_1fr] lg:items-start lg:gap-14">
              {/* Main column */}
              <div className="space-y-12">
                {event.description ? (
                  <section aria-labelledby="about-event">
                    <h2 id="about-event" className="font-display text-2xl text-white">
                      About this event
                    </h2>
                    {/* Description is plain text (confirmed). Paragraph split on blank lines —
                        never dangerouslySetInnerHTML, so there is no injection surface. */}
                    <div className="mt-4 space-y-4">
                      {String(event.description)
                        .split(/\n\s*\n/)
                        .map((paragraph, index) => (
                          <p key={index} className="text-base leading-relaxed text-slate-300 whitespace-pre-line">
                            {paragraph.trim()}
                          </p>
                        ))}
                    </div>
                  </section>
                ) : null}

                {event.rules?.length ? (
                  <section aria-labelledby="rules">
                    <h2 id="rules" className="font-display text-2xl text-white">
                      Rules &amp; eligibility
                    </h2>
                    <ol className="mt-5 space-y-3.5">
                      {event.rules.map((rule, index) => (
                        <li key={rule.ruleId} className="flex gap-4">
                          <span
                            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-nexus-mint/30 bg-nexus-mint/10 text-xs font-bold text-nexus-mint"
                            aria-hidden="true"
                          >
                            {index + 1}
                          </span>
                          <p className="text-sm leading-relaxed text-slate-300">{rule.ruleText}</p>
                        </li>
                      ))}
                    </ol>
                  </section>
                ) : null}

                {event.slots?.length ? (
                  <section aria-labelledby="schedule">
                    <h2 id="schedule" className="font-display text-2xl text-white">
                      Time slots
                    </h2>
                    <ul className="mt-5 space-y-3">
                      {event.slots.map((slot) => (
                        <li key={slot.slotId} className="nx-surface flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                          <span className="text-sm font-semibold text-white">
                            {formatOrHide(slot.title) || 'Session'}
                          </span>
                          <span className="text-xs text-slate-400">
                            Day {slot.dayNumber}
                            {formatOrHide(slot.venue) ? ` · ${formatOrHide(slot.venue)}` : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </div>

              {/* Sidebar */}
              <aside className="space-y-6 lg:sticky lg:top-24">
                <div className="nx-surface p-6">
                  <h2 className="font-display text-lg text-white">Event details</h2>
                  <dl className="mt-4">
                    <FactRow
                      label="Team size"
                      value={formatTeamSize(event.minTeamSize, event.maxTeamSize)}
                    />
                    <FactRow label="Duration" value={formatOrHide(event.durationText)} />
                    <FactRow label="Venue" value={formatOrHide(event.venue)} />
                    <FactRow label="Prize pool" value={formatOrHide(event.prizePool)} highlight />
                    <FactRow label="Winner" value={formatOrHide(event.winnerPrize)} />
                    <FactRow label="Runner-up" value={formatOrHide(event.runnerUpPrize)} />
                    <FactRow label="Entry fee" value={formatEntryFee(event.entryFee)} highlight />
                  </dl>

                  {/* Longer prize copy does not fit the two-column fact rows. */}
                  {formatOrHide(event.prizeInfo) ? (
                    <div className="mt-5 rounded-xl border border-nexus-mint/20 bg-nexus-mint/[0.07] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nexus-mint">
                        Prizes
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                        {event.prizeInfo}
                      </p>
                    </div>
                  ) : null}
                </div>

                {event.coordinators?.length ? (
                  <div className="nx-surface p-6">
                    <h2 className="font-display text-lg text-white">Coordinators</h2>
                    <ul className="mt-4 space-y-4">
                      {event.coordinators.map((coordinator) => (
                        <li key={coordinator.coordinatorId} className="flex items-start gap-3">
                          <span
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xs font-bold text-nexus-lilac"
                            aria-hidden="true"
                          >
                            {coordinator.fullName
                              .split(' ')
                              .slice(0, 2)
                              .map((part) => part[0])
                              .join('')}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {coordinator.fullName}
                            </p>
                            {coordinator.role ? (
                              <p className="text-xs text-slate-500">{coordinator.role}</p>
                            ) : null}
                            {coordinator.email ? (
                              <a
                                href={`mailto:${coordinator.email}`}
                                className="mt-0.5 block truncate text-xs text-nexus-mint hover:underline"
                              >
                                {coordinator.email}
                              </a>
                            ) : null}
                            {/* Phone is gated by FEATURES.SHOW_COORDINATOR_PHONE (privacy). */}
                            {FEATURES.SHOW_COORDINATOR_PHONE && coordinator.phone ? (
                              <a
                                href={`tel:${coordinator.phone}`}
                                className="block text-xs text-nexus-mint hover:underline"
                              >
                                {coordinator.phone}
                              </a>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {/* Event manager — the 1:1 contact on the Events table, shown only
                    when the event has no coordinator rows of its own. */}
                {!event.coordinators?.length && formatOrHide(event.managerName) ? (
                  <div className="nx-surface p-6">
                    <h2 className="font-display text-lg text-white">Event manager</h2>
                    <p className="mt-3 text-sm font-semibold text-white">{event.managerName}</p>
                    {event.managerEmail ? (
                      <a
                        href={`mailto:${event.managerEmail}`}
                        className="mt-1 block truncate text-xs text-nexus-mint hover:underline"
                      >
                        {event.managerEmail}
                      </a>
                    ) : null}
                    {FEATURES.SHOW_COORDINATOR_PHONE && event.managerPhone ? (
                      <a
                        href={`tel:${event.managerPhone}`}
                        className="block text-xs text-nexus-mint hover:underline"
                      >
                        {event.managerPhone}
                      </a>
                    ) : null}
                  </div>
                ) : null}

                {/* Sticky sidebar CTA so Register is reachable without
                    scrolling back to the banner on long pages. */}
                {FEATURES.REGISTRATION_CTA ? (
                  <div className="nx-surface p-6">
                    <h2 className="font-display text-lg text-white">Take part</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      Registration is handled online through this portal.
                    </p>
                    <RegisterButton
                      eventTitle={event.title}
                      className="mt-4 w-full justify-center"
                    />
                  </div>
                ) : null}
              </aside>
            </div>

            {/* ---------- Related ---------- */}
            {related.length ? (
              <section className="nx-container border-t border-white/8 py-16">
                <SectionTitle
                  eyebrow="Keep exploring"
                  title={`More from ${event.tierName || `Tier ${event.tierLevel}`}`}
                />
                <div className="mt-9">
                  <EventGrid events={related} variant="medium" />
                </div>
              </section>
            ) : null}
          </>
        ) : null}
      </AsyncBoundary>
    </>
  );
}
