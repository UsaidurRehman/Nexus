import { Link } from 'react-router-dom';
import { BRAND, FEATURES, ROUTES, SITE, formatDateRange, formatOrHide } from '../../config.js';
import { useScrollProgress } from '../../hooks/useScrollProgress.js';
import Countdown from '../common/Countdown.jsx';

/**
 * Full-bleed hero built around the official NEXUS '26 banner.
 *
 * Responsiveness + scroll behaviour (client requirement):
 *  - The banner is a background layer that always covers the viewport, so it
 *    never letterboxes or distorts on any screen size.
 *  - On scroll it drifts upward and fades at roughly half the page speed
 *    (parallax), handing over to the content underneath.
 *  - On mobile, `background-attachment: fixed` is avoided (iOS Safari bug) —
 *    we use a transform instead, which is GPU-composited and smooth.
 *  - The transform is disabled under prefers-reduced-motion.
 */
export default function Hero({ fest }) {
  const { scrollY } = useScrollProgress();

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const offset = reduced ? 0 : Math.min(scrollY * 0.4, 260);
  const scale = reduced ? 1 : 1 + Math.min(scrollY / 5200, 0.09);
  const contentFade = reduced ? 1 : Math.max(0, 1 - scrollY / 520);

  const bannerUrl = fest?.bannerUrl || BRAND.HERO_BANNER;
  const dateRange = formatDateRange(fest?.startDate, fest?.endDate);
  const venue = formatOrHide(fest?.venueSummary);

  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden">
      {/* Parallax banner layer */}
      <div
        className="absolute inset-0 -z-20 will-change-transform"
        style={{
          transform: `translate3d(0, ${offset}px, 0) scale(${scale})`,
          transformOrigin: 'center 35%',
        }}
        aria-hidden="true"
      >
        <img
          src={bannerUrl}
          alt=""
          fetchpriority="high"
          decoding="async"
          className="h-full w-full object-cover object-center"
        />
      </div>

      {/* Legibility wash: keeps the banner readable without dulling it */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-nexus-ink/70 via-nexus-navy/45 to-nexus-ink"
        aria-hidden="true"
      />
      {/* Brand glow + cartographic grid, echoing the banner's map texture */}
      <div className="nx-glow absolute inset-0 -z-10 opacity-70" aria-hidden="true" />
      <div className="nx-grid-bg absolute inset-0 -z-10 opacity-25" aria-hidden="true" />

      {/* Content */}
      <div
        className="nx-container relative z-10 py-28 sm:py-32"
        style={{ opacity: contentFade, transform: `translateY(${reduced ? 0 : scrollY * 0.12}px)` }}
      >
        <div className="max-w-3xl">
          <span className="nx-chip animate-fade-up">
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-mint opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-mint" />
            </span>
            {BRAND.ORGANISER} · 7-day tech fest
          </span>

          <h1
            className="mt-7 font-display text-[clamp(3.2rem,13vw,9rem)] leading-[0.82] tracking-tightest animate-fade-up"
            style={{ animationDelay: '80ms' }}
          >
            <span className="nx-gradient-text">{fest?.name || BRAND.NAME}</span>
          </h1>

          {/* Urdu tagline, rendered RTL in isolation without flipping the UI */}
          {/* Urdu tagline, flanked by the mint rules used in the banner lock-up */}
          <div
            className="mt-5 flex items-center gap-4 animate-fade-up"
            style={{ animationDelay: '150ms' }}
          >
            <span className="h-px w-10 bg-nexus-mint sm:w-16" aria-hidden="true" />
            <p className="text-2xl text-nexus-mint sm:text-3xl" dir="rtl" lang="ur">
              {fest?.tagline || BRAND.TAGLINE_UR}
            </p>
            <span className="h-px flex-1 max-w-[140px] bg-nexus-mint/40" aria-hidden="true" />
          </div>

          <div
            className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 animate-fade-up"
            style={{ animationDelay: '220ms' }}
          >
            {dateRange ? (
              <span className="inline-flex items-center gap-2 text-base font-bold text-white sm:text-lg">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" className="text-nexus-mint" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path strokeLinecap="round" d="M3 10h18M8 3v4M16 3v4" />
                </svg>
                {dateRange}
              </span>
            ) : null}
            {venue ? (
              <span className="inline-flex items-center gap-2 text-sm text-nexus-lilac sm:text-base">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" className="text-nexus-mint" aria-hidden="true">
                  <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="2.6" />
                </svg>
                {venue}
              </span>
            ) : null}
          </div>

          <p
            className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 animate-fade-up sm:text-[17px]"
            style={{ animationDelay: '290ms' }}
          >
            {fest?.description || SITE.DEFAULT_DESCRIPTION}
          </p>

          {FEATURES.COUNTDOWN && fest?.startDate ? (
            <div className="mt-9 animate-fade-up" style={{ animationDelay: '360ms' }}>
              <Countdown targetDate={fest.startDate} />
            </div>
          ) : null}

          <div className="mt-10 flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: '430ms' }}>
            <Link to={ROUTES.EVENTS} className="nx-btn-primary">
              Explore Events
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h13M13 6l6 6-6 6" />
              </svg>
            </Link>
            <a href="#about" className="nx-btn-ghost">
              About Nexus
            </a>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2"
        style={{ opacity: contentFade }}
        aria-hidden="true"
      >
        <div className="flex h-11 w-7 items-start justify-center rounded-full border-2 border-white/25 p-1.5">
          <span className="h-2 w-1 animate-bounce rounded-full bg-nexus-mint" />
        </div>
      </div>
    </section>
  );
}
