import { Link } from 'react-router-dom';
import {
  BOOKLET,
  BRAND,
  FEATURES,
  NAV_LINKS,
  ROUTES,
  SITE,
  formatDateRange,
  formatOrHide,
} from '../../config.js';

const SOCIALS = [
  { key: 'instagramUrl', label: 'Instagram', path: 'M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 1.8.25 2.2.42.6.22 1 .48 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c0-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 3.2A6.6 6.6 0 1 0 18.6 12 6.6 6.6 0 0 0 12 5.4Zm0 10.9A4.3 4.3 0 1 1 16.3 12 4.3 4.3 0 0 1 12 16.3Zm6.9-11.1a1.5 1.5 0 1 1-1.6-1.6 1.5 1.5 0 0 1 1.6 1.6Z' },
  { key: 'linkedInUrl', label: 'LinkedIn', path: 'M6.94 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM3.2 8.5h3.5V21H3.2V8.5Zm5.9 0h3.35v1.7h.05a3.67 3.67 0 0 1 3.3-1.82c3.53 0 4.2 2.33 4.2 5.35V21h-3.5v-5.57c0-1.33 0-3.04-1.85-3.04s-2.14 1.45-2.14 2.94V21H9.1V8.5Z' },
  { key: 'facebookUrl', label: 'Facebook', path: 'M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.5l.5-3H13v-2c0-.6.4-1 1-1Z' },
];

export default function Footer({ fest }) {
  const year = new Date().getFullYear();
  const dateRange = formatDateRange(fest?.startDate, fest?.endDate);
  const venue = formatOrHide(fest?.venueSummary);

  return (
    <footer className="relative mt-24 border-t border-white/10 bg-nexus-ink">
      <div className="nx-grid-bg absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="nx-container relative py-14">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <Link to={ROUTES.HOME} className="inline-flex items-center gap-3" aria-label="Go to home page">
              <img src={BRAND.LOGO} alt="" width="44" height="44" className="h-11 w-11" />
              <span className="font-display text-2xl text-white">{BRAND.NAME}</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              {fest?.description
                ? `${fest.description.slice(0, 150)}${fest.description.length > 150 ? '…' : ''}`
                : SITE.DEFAULT_DESCRIPTION}
            </p>
            {dateRange ? (
              <p className="mt-5 text-sm font-semibold text-nexus-lilac">{dateRange}</p>
            ) : null}
            <p className="text-sm text-slate-400">{venue || BRAND.ORGANISER}</p>
          </div>

          <nav aria-label="Footer">
            <h2 className="font-display text-sm uppercase tracking-[0.2em] text-white">Explore</h2>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-slate-400 transition-colors hover:text-nexus-mint">
                    {link.label}
                  </Link>
                </li>
              ))}
              {FEATURES.BOOKLET_LINK ? (
                <li>
                  <a
                    href={BOOKLET.URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-400 transition-colors hover:text-nexus-mint"
                  >
                    {BOOKLET.LABEL}
                  </a>
                </li>
              ) : null}
            </ul>
          </nav>

          <div>
            <h2 className="font-display text-sm uppercase tracking-[0.2em] text-white">Contact</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              {fest?.contactEmail ? (
                <li>
                  <a href={`mailto:${fest.contactEmail}`} className="transition-colors hover:text-nexus-mint">
                    {fest.contactEmail}
                  </a>
                </li>
              ) : null}
              {fest?.contactPhone ? (
                <li>
                  <a href={`tel:${fest.contactPhone}`} className="transition-colors hover:text-nexus-mint">
                    {fest.contactPhone}
                  </a>
                </li>
              ) : null}
              {fest?.executiveHead ? (
                <li className="pt-1 text-slate-500">
                  Executive Head: <span className="text-slate-300">{fest.executiveHead}</span>
                </li>
              ) : null}
            </ul>

            <div className="mt-5 flex gap-3">
              {SOCIALS.filter((social) => fest?.[social.key]).map((social) => (
                <a
                  key={social.key}
                  href={fest[social.key]}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-slate-300 transition-all hover:border-nexus-mint hover:text-nexus-mint"
                >
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="currentColor" aria-hidden="true" style={{ width: 18, height: 18 }}>
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {BRAND.FULL_NAME} · {BRAND.ORGANISER}. All rights reserved.</p>
          <p>Built for the Nexus organising committee.</p>
        </div>
      </div>
    </footer>
  );
}
