import { Link } from 'react-router-dom';
import Hero from '../components/layout/Hero.jsx';
import Seo from '../components/common/Seo.jsx';
import SectionTitle from '../components/common/SectionTitle.jsx';
import RevealOnScroll from '../components/common/RevealOnScroll.jsx';
import AsyncBoundary from '../components/common/AsyncBoundary.jsx';
import { EventGridSkeleton } from '../components/common/Skeletons.jsx';
import EventGrid from '../components/events/EventGrid.jsx';
import { useEvents, useFestInfo, useTiers } from '../hooks/useFestData.js';
import RegisterButton from '../components/events/RegisterButton.jsx';
import { BOOKLET, FEATURES, ROUTES, SITE, formatOrHide, getTierPresentation } from '../config.js';

function StatCard({ value, label }) {
  return (
    <div className="nx-surface px-6 py-7 text-center">
      <p className="font-display text-4xl text-nexus-mint sm:text-5xl">{value}</p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
    </div>
  );
}

export default function Home() {
  const { data: fest } = useFestInfo();
  const { data: tiers = [] } = useTiers();
  const eventsQuery = useEvents();
  const events = eventsQuery.data || [];

  // Highlight reel: featured events first, then Tier 1, capped at 3.
  const highlights = [...events]
    .sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return a.tierLevel - b.tierLevel;
    })
    .slice(0, 3);

  const tierCounts = tiers.map((tier) => ({
    ...tier,
    count: events.filter((event) => event.tierLevel === tier.tierLevel).length,
    presentation: getTierPresentation(tier.tierLevel),
  }));

  return (
    <>
      <Seo
        title={null}
        description={fest?.description || SITE.DEFAULT_DESCRIPTION}
        image={fest?.bannerUrl}
        path="/"
      />

      <Hero fest={fest} />

      {/* ---------------- About ---------------- */}
      <section id="about" className="nx-container scroll-mt-24 py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:items-start">
          <RevealOnScroll>
            <SectionTitle
              eyebrow="About the fest"
              title="Seven days of building, breaking and competing"
              description={fest?.description || SITE.DEFAULT_DESCRIPTION}
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="nx-chip">Team-based competitions</span>
              <span className="nx-chip">Three event tiers</span>
              <span className="nx-chip">Open to all students</span>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={120}>
            <div className="grid grid-cols-2 gap-4">
              <StatCard value="7" label="Days" />
              <StatCard value={events.length || '—'} label="Events" />
              <StatCard value="3" label="Tiers" />
              <StatCard value="100+" label="Participants" />
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ---------------- Tier overview ---------------- */}
      <section className="relative overflow-hidden border-y border-white/8 bg-nexus-navy/25 py-20 sm:py-24">
        <div className="nx-grid-bg absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="nx-container relative">
          <RevealOnScroll>
            <SectionTitle
              eyebrow="How events are organised"
              title="Three tiers, one festival"
              description="Every Nexus competition sits in one of three tiers. Tier 1 events are the long, flagship contests. Tier 2 are mid-level. Tier 3 are the quick-fire events you can join between everything else."
            />
          </RevealOnScroll>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {tierCounts.map((tier, index) => (
              <RevealOnScroll key={tier.tierId} delay={index * 110}>
                <Link
                  to={`${ROUTES.EVENTS}#tier-${tier.tierLevel}`}
                  className="nx-surface group flex h-full flex-col p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-nexus-mint/40"
                >
                  <span
                    className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl font-display text-lg text-nexus-ink"
                    style={{ backgroundColor: tier.presentation.accent }}
                    aria-hidden="true"
                  >
                    {tier.tierLevel}
                  </span>
                  <h3 className="font-display text-2xl text-white transition-colors group-hover:text-nexus-mint">
                    {tier.name}
                  </h3>
                  {formatOrHide(tier.description) ? (
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
                      {formatOrHide(tier.description)}
                    </p>
                  ) : (
                    <span className="flex-1" />
                  )}
                  <span className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-nexus-lilac">
                    {tier.count} {tier.count === 1 ? 'event' : 'events'}
                  </span>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Highlights ---------------- */}
      <section className="nx-container py-20 sm:py-28">
        <div className="mb-11 flex flex-wrap items-end justify-between gap-5">
          <SectionTitle
            eyebrow="Highlights"
            title="The events everyone shows up for"
            description="A glimpse of the line-up. The full list is organised tier by tier."
          />
          <Link
            to={ROUTES.EVENTS}
            className="inline-flex shrink-0 items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-nexus-mint hover:underline"
          >
            View all events
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h13M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>

        <AsyncBoundary
          isLoading={eventsQuery.isLoading}
          isError={eventsQuery.isError}
          error={eventsQuery.error}
          onRetry={eventsQuery.refetch}
          isEmpty={!highlights.length}
          emptyTitle="No events published yet"
          emptyMessage="The line-up is being finalised. Check back shortly."
          skeleton={<EventGridSkeleton count={3} variant="large" />}
        >
          <EventGrid events={highlights} variant="large" />
        </AsyncBoundary>
      </section>

      {/* ---------------- Booklet + Register ---------------- */}
      {FEATURES.BOOKLET_LINK || FEATURES.REGISTRATION_CTA ? (
        <section className="nx-container pb-20">
          <RevealOnScroll>
            <div className="nx-surface grid gap-7 p-7 sm:p-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
              <div>
                <span className="nx-chip">Plan your Nexus</span>
                <h2 className="mt-4 font-display text-2xl leading-tight text-white sm:text-3xl">
                  Everything in one booklet
                </h2>
                <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-400">
                  {BOOKLET.DESCRIPTION} Read it before you register so you pick the events that
                  suit your team.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  {FEATURES.BOOKLET_LINK ? (
                    <a
                      href={BOOKLET.URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nx-btn nx-btn-primary"
                    >
                      Open the {BOOKLET.LABEL}
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5h5v5M19 5l-9 9M18 14v5H5V6h5" />
                      </svg>
                    </a>
                  ) : null}
                  <RegisterButton variant="ghost" />
                </div>
              </div>

              {/* Fest facts, straight from GET /fest */}
              <dl className="grid grid-cols-2 gap-3">
                {fest?.totalEvents ? (
                  <div className="rounded-2xl border border-white/10 bg-nexus-abyss/50 p-4">
                    <dt className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Events</dt>
                    <dd className="mt-1 font-display text-3xl text-nexus-mint">
                      {fest.totalEvents}
                    </dd>
                  </div>
                ) : null}
                {fest?.durationDays ? (
                  <div className="rounded-2xl border border-white/10 bg-nexus-abyss/50 p-4">
                    <dt className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Days</dt>
                    <dd className="mt-1 font-display text-3xl text-nexus-cyan">
                      {fest.durationDays}
                    </dd>
                  </div>
                ) : null}
                {tiers.length ? (
                  <div className="rounded-2xl border border-white/10 bg-nexus-abyss/50 p-4">
                    <dt className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Tiers</dt>
                    <dd className="mt-1 font-display text-3xl text-nexus-lilac">{tiers.length}</dd>
                  </div>
                ) : null}
                <div className="rounded-2xl border border-white/10 bg-nexus-abyss/50 p-4">
                  <dt className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Opens</dt>
                  <dd className="mt-1 font-display text-xl leading-tight text-white">1 Nov 2026</dd>
                </div>
              </dl>
            </div>
          </RevealOnScroll>
        </section>
      ) : null}

      {/* ---------------- CTA ---------------- */}
      <section className="nx-container pb-24">
        <RevealOnScroll>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 px-7 py-16 text-center sm:px-14 sm:py-20">
            <div className="absolute inset-0 bg-nexus-grad" aria-hidden="true" />
            <div className="nx-grid-bg absolute inset-0 opacity-20" aria-hidden="true" />
            <div
              className="absolute inset-0"
              style={{ background: 'radial-gradient(70% 90% at 50% 120%, rgba(125,251,164,.35), transparent 70%)' }}
              aria-hidden="true"
            />
            <div className="relative">
              <h2 className="font-display text-3xl leading-[1.02] tracking-tightest text-white sm:text-[56px]">
                Find your event.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-white/80">
                Browse every competition across all three tiers, read the full rules and see what it
                takes to compete at Nexus.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Link to={ROUTES.EVENTS} className="nx-btn-primary">
                  Explore Events
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h13M13 6l6 6-6 6" />
                  </svg>
                </Link>
                <RegisterButton variant="ghost" />
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>
    </>
  );
}
