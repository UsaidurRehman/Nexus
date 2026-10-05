import { useCountdown } from '../../hooks/useCountdown.js';
import { SITE } from '../../config.js';

function Unit({ value, label }) {
  return (
    <div className="flex min-w-[68px] flex-col items-center rounded-xl border border-white/12 bg-white/[0.06] px-3 py-3 backdrop-blur-md sm:min-w-[86px] sm:px-5 sm:py-4">
      <span className="font-display text-2xl tabular-nums text-white sm:text-4xl">
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-nexus-lilac sm:text-[11px]">
        {label}
      </span>
    </div>
  );
}

/** Counts down to the fest start. All times are PKT — no client TZ conversion. */
export default function Countdown({ targetDate }) {
  const time = useCountdown(targetDate);
  if (!time) return null;

  if (time.isLive) {
    return (
      <div className="inline-flex items-center gap-3 rounded-full border border-nexus-mint/40 bg-nexus-mint/10 px-6 py-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-mint opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-nexus-mint" />
        </span>
        <span className="font-display text-sm uppercase tracking-[0.2em] text-nexus-mint">
          Nexus is live
        </span>
      </div>
    );
  }

  return (
    <div>
      <div
        className="flex flex-wrap gap-2.5 sm:gap-3"
        role="timer"
        aria-label={`Countdown to Nexus: ${time.days} days remaining`}
      >
        <Unit value={time.days} label="Days" />
        <Unit value={time.hours} label="Hours" />
        <Unit value={time.minutes} label="Mins" />
        <Unit value={time.seconds} label="Secs" />
      </div>
      <p className="mt-2.5 text-[11px] uppercase tracking-[0.18em] text-slate-500">
        All times {SITE.TIMEZONE_LABEL}
      </p>
    </div>
  );
}
