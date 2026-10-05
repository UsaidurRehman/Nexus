import { getTierPresentation } from '../../config.js';

/** Anchor chips that jump to each tier block. Keyboard accessible by default. */
export default function TierJumpLinks({ tiers, counts }) {
  const visible = tiers.filter((tier) => (counts[tier.tierLevel] || 0) > 0);
  if (visible.length < 2) return null;

  return (
    <nav aria-label="Jump to tier" className="flex flex-wrap gap-2.5">
      {visible.map((tier) => {
        const presentation = getTierPresentation(tier.tierLevel);
        return (
          <a
            key={tier.tierId}
            href={`#tier-${tier.tierLevel}`}
            className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-300 transition-all hover:border-nexus-mint/50 hover:text-white"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: presentation.accent }}
              aria-hidden="true"
            />
            {tier.name}
            <span className="text-slate-500 group-hover:text-nexus-mint">
              {counts[tier.tierLevel]}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
