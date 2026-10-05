import { Link } from 'react-router-dom';
import RegisterButton from './RegisterButton.jsx';
import {
  BRAND,
  FEATURES,
  ROUTES,
  buildMonogram,
  formatEntryFee,
  formatOrHide,
  formatTeamSize,
  getTierPresentation,
} from '../../config.js';

/** Brand-gradient monogram shown when an event has no image yet. */
function MonogramArt({ title, tierLevel, className = '' }) {
  const gradients = {
    1: 'linear-gradient(135deg,#000B86 0%,#0146DB 55%,#3BE38B 125%)',
    2: 'linear-gradient(135deg,#001071 0%,#0022A8 55%,#4F8BE8 125%)',
    3: 'linear-gradient(135deg,#00053F 0%,#001071 60%,#0146DB 130%)',
  };
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: gradients[tierLevel] || gradients[3] }}
      aria-hidden="true"
    >
      <div className="nx-grid-bg absolute inset-0 opacity-60" />
      <span className="relative font-display text-5xl text-white/25">{buildMonogram(title)}</span>
    </div>
  );
}

function Meta({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
      <span className="text-nexus-mint" aria-hidden="true">
        {icon}
      </span>
      {children}
    </span>
  );
}

const ICONS = {
  team: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" d="M16 19v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V19M9 9.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM22 19v-1.5a4 4 0 0 0-3-3.87M16 2.6a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 7.5V12l3 2" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  ),
  trophy: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" d="M7 4h10v5a5 5 0 0 1-10 0V4ZM7 6H4.5A2.5 2.5 0 0 0 7 9.5M17 6h2.5A2.5 2.5 0 0 1 17 9.5M9.5 20h5M12 14v6" />
    </svg>
  ),
};

/**
 * One event card in three sizes, driven by tier (§7.4):
 *   large   -> Tier 1   medium -> Tier 2   compact -> Tier 3
 */
export default function EventCard({ event, variant: variantProp }) {
  const presentation = getTierPresentation(event.tierLevel);
  const variant = variantProp || presentation.variant;
  const to = ROUTES.EVENT_DETAIL(event.slug);

  const mediaHeight =
    variant === 'large' ? 'h-52 sm:h-64' : variant === 'compact' ? 'h-32' : 'h-44';

  const duration = formatOrHide(event.durationText);
  const venue = formatOrHide(event.venue);

  const titleSize =
    variant === 'large'
      ? 'text-2xl sm:text-[28px]'
      : variant === 'compact'
        ? 'text-base'
        : 'text-xl';

  return (
    <article className="nx-surface group flex h-full flex-col overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:border-nexus-mint/40 hover:shadow-card focus-within:-translate-y-1.5">
      <Link to={to} className="flex flex-1 flex-col outline-none">
        {/* Media */}
        <div className={`relative w-full shrink-0 overflow-hidden ${mediaHeight}`}>
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <MonogramArt
              title={event.title}
              tierLevel={event.tierLevel}
              className="h-full w-full transition-transform duration-700 group-hover:scale-105"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-nexus-ink via-nexus-ink/20 to-transparent" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-nexus-ink"
              style={{ backgroundColor: presentation.accent }}
            >
              {event.tierName || `Tier ${event.tierLevel}`}
            </span>
            {event.isFeatured && variant !== 'compact' ? (
              <span className="rounded-full border border-white/25 bg-black/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                Featured
              </span>
            ) : null}
          </div>

          {event.category ? (
            <span className="absolute bottom-3 left-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-nexus-lilac">
              {event.category}
            </span>
          ) : null}
        </div>

        {/* Body */}
        <div className={`flex flex-1 flex-col ${variant === 'compact' ? 'gap-2 p-4' : 'gap-3 p-5'}`}>
          <h3 className={`font-display leading-tight text-white transition-colors group-hover:text-nexus-mint ${titleSize}`}>
            {event.title}
          </h3>

          {variant !== 'compact' && event.shortSummary ? (
            <p className={`text-sm leading-relaxed text-slate-400 ${variant === 'large' ? 'nx-clamp-3' : 'nx-clamp-2'}`}>
              {event.shortSummary}
            </p>
          ) : null}

          {/* Unconfirmed fields are omitted entirely, never labelled "TBA". */}
          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-2">
            <Meta icon={ICONS.team}>{formatTeamSize(event.minTeamSize, event.maxTeamSize)}</Meta>
            {duration ? <Meta icon={ICONS.clock}>{duration}</Meta> : null}
            {variant === 'large' && venue ? <Meta icon={ICONS.pin}>{venue}</Meta> : null}
          </div>

          {variant !== 'compact' ? (
            <div className="flex items-center justify-between border-t border-white/8 pt-3">
              <span className="text-xs font-semibold text-nexus-mint">
                {formatEntryFee(event.entryFee)}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-300 transition-colors group-hover:text-nexus-mint">
                Details
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h13M13 6l6 6-6 6" />
                </svg>
              </span>
            </div>
          ) : (
            <span className="text-xs font-semibold text-nexus-mint">
              {formatEntryFee(event.entryFee)}
            </span>
          )}
        </div>
      </Link>

      {/* Register sits OUTSIDE the <Link>: a <button> inside an <a> is invalid
          HTML and breaks keyboard navigation. */}
      {FEATURES.REGISTRATION_CTA ? (
        <div className={`mt-auto border-t border-white/8 ${variant === 'compact' ? 'p-3' : 'p-4'}`}>
          <RegisterButton
            eventTitle={event.title}
            variant={variant === 'compact' ? 'compact' : 'primary'}
            className={variant === 'compact' ? 'w-full' : 'w-full text-sm'}
          />
        </div>
      ) : null}
    </article>
  );
}

export { MonogramArt };
