import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BOOKLET,
  FEATURES,
  REGISTRATION,
  SITE,
  formatDateRange,
  getRegistrationState,
} from '../../config.js';
import { useFestInfo } from '../../hooks/useFestData.js';

/** Breaks a millisecond span into whole days/hours/minutes/seconds. */
function splitDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

function CountdownUnit({ value, label }) {
  return (
    <div className="flex min-w-[64px] flex-col items-center rounded-xl border border-white/10 bg-nexus-abyss/70 px-3 py-2.5">
      <span className="font-display text-2xl leading-none tabular-nums text-nexus-mint">
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>
    </div>
  );
}

/**
 * "Coming soon" dialog shown whenever registration is not yet open.
 * Rendered in a portal so a card's `overflow-hidden` cannot clip it.
 */
function RegistrationDialog({ open, onClose, eventTitle, opensAt, festInfo }) {
  const [remaining, setRemaining] = useState(() => getRegistrationState().msRemaining);

  // Tick once a second, but only while the dialog is actually open.
  useEffect(() => {
    if (!open) return undefined;
    setRemaining(getRegistrationState().msRemaining);
    const id = setInterval(() => setRemaining(getRegistrationState().msRemaining), 1000);
    return () => clearInterval(id);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  const { days, hours, minutes, seconds } = splitDuration(remaining);

  const opensLabel = opensAt.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: SITE.TIMEZONE,
  });

  const festRange =
    festInfo?.startDate && festInfo?.endDate
      ? formatDateRange(festInfo.startDate, festInfo.endDate)
      : null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-nexus-ink/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="registration-dialog-title"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="nx-surface relative w-full max-w-lg p-6 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
            <path strokeLinecap="round" d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <span className="nx-chip">Coming soon</span>

        <h2 id="registration-dialog-title" className="mt-4 font-display text-2xl leading-tight text-white sm:text-3xl">
          {REGISTRATION.COMING_SOON_TITLE}
        </h2>

        {eventTitle ? (
          <p className="mt-2 text-sm text-slate-400">
            You are registering for <span className="font-semibold text-white">{eventTitle}</span>.
          </p>
        ) : null}

        <p className="mt-4 text-sm leading-relaxed text-slate-300">
          {REGISTRATION.COMING_SOON_BODY}
        </p>

        {/* Live countdown to 1 November 2026 */}
        <div className="mt-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Registration opens in
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <CountdownUnit value={days} label="Days" />
            <CountdownUnit value={hours} label="Hours" />
            <CountdownUnit value={minutes} label="Mins" />
            <CountdownUnit value={seconds} label="Secs" />
          </div>
        </div>

        {/* The two dates, stated plainly */}
        <dl className="mt-6 space-y-2.5 border-t border-white/8 pt-5 text-sm">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-slate-500">Registration opens</dt>
            <dd className="text-right font-semibold text-nexus-mint">{opensLabel}</dd>
          </div>
          {festRange ? (
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-slate-500">Festival dates</dt>
              <dd className="text-right font-semibold text-slate-200">{festRange}</dd>
            </div>
          ) : null}
          {festInfo?.venueSummary ? (
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-slate-500">Venue</dt>
              <dd className="text-right font-semibold text-slate-200">{festInfo.venueSummary}</dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-7 flex flex-wrap gap-2.5">
          {FEATURES.BOOKLET_LINK ? (
            <a
              href={BOOKLET.URL}
              target="_blank"
              rel="noopener noreferrer"
              className="nx-btn nx-btn-primary text-sm"
            >
              Read the {BOOKLET.LABEL}
            </a>
          ) : null}
          <button type="button" onClick={onClose} className="nx-btn nx-btn-ghost text-sm">
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * Register call-to-action.
 *
 * Before 1 Nov 2026 it opens the countdown dialog. On or after that date it
 * becomes a real link — but only if a registration URL has been configured;
 * otherwise it keeps showing the dialog rather than rendering a dead link.
 *
 * @param {{eventTitle?: string, variant?: 'primary'|'ghost'|'compact', className?: string}} props
 */
export default function RegisterButton({ eventTitle, variant = 'primary', className = '' }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: festInfo } = useFestInfo();

  // Re-resolved per render so the gate flips without a page reload.
  const state = useMemo(() => getRegistrationState(), []);

  if (!FEATURES.REGISTRATION_CTA) return null;

  const classes = {
    primary: 'nx-btn nx-btn-primary',
    ghost: 'nx-btn nx-btn-ghost',
    compact:
      'inline-flex items-center justify-center gap-1.5 rounded-full border border-nexus-mint/35 ' +
      'bg-nexus-mint/10 px-3.5 py-1.5 text-xs font-bold text-nexus-mint transition ' +
      'hover:border-nexus-mint/60 hover:bg-nexus-mint/20',
  }[variant];

  // Open: a real outbound link.
  if (state.open && state.href) {
    return (
      <a
        href={state.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${classes} ${className}`}
      >
        {state.label}
      </a>
    );
  }

  // Not open yet (or no URL configured): show the dialog.
  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          // Cards are wrapped in a <Link>; don't navigate when Register is hit.
          event.preventDefault();
          event.stopPropagation();
          setDialogOpen(true);
        }}
        className={`${classes} ${className}`}
      >
        {state.label}
      </button>

      <RegistrationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        eventTitle={eventTitle}
        opensAt={state.opensAt}
        festInfo={festInfo}
      />
    </>
  );
}
