import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import RegisterButton from '../events/RegisterButton.jsx';
import { BOOKLET, BRAND, FEATURES, NAV_LINKS, ROUTES } from '../../config.js';

/**
 * Sticky header. The BIIT/Nexus logo sits top-left and always routes home
 * (client requirement), including from the 404 page.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setMenuOpen(false), [pathname]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const linkClass = ({ isActive }) =>
    `relative px-1 py-2 text-sm font-semibold tracking-wide transition-colors ${
      isActive ? 'text-nexus-mint' : 'text-slate-300 hover:text-white'
    }`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/10 bg-nexus-ink/85 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="nx-container flex h-[72px] items-center justify-between" aria-label="Main">
        {/* Logo — top left, click returns to Home */}
        <Link
          to={ROUTES.HOME}
          aria-label={`${BRAND.FULL_NAME} — go to home page`}
          className="group flex items-center gap-3"
        >
          <img
            src={BRAND.LOGO}
            alt=""
            width="40"
            height="40"
            className="h-9 w-9 shrink-0 transition-transform duration-300 group-hover:scale-110 sm:h-10 sm:w-10"
          />
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg tracking-tight text-white sm:text-xl">
              {BRAND.NAME}
            </span>
            <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-nexus-lilac/80">
              {BRAND.ORGANISER}
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} end={link.end} className={linkClass}>
                {({ isActive }) => (
                  <>
                    {link.label}
                    <span
                      className={`absolute -bottom-0.5 left-0 h-0.5 bg-nexus-mint transition-all duration-300 ${
                        isActive ? 'w-full' : 'w-0'
                      }`}
                      aria-hidden="true"
                    />
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          {FEATURES.BOOKLET_LINK ? (
            <a
              href={BOOKLET.URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-slate-300 transition-colors hover:text-nexus-mint"
            >
              {BOOKLET.LABEL}
            </a>
          ) : null}
          <RegisterButton variant="compact" />
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white md:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {menuOpen ? (
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className="border-t border-white/10 bg-nexus-ink/97 backdrop-blur-xl md:hidden"
      >
        <ul className="nx-container flex flex-col py-4">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `block border-b border-white/5 py-4 text-base font-semibold ${
                    isActive ? 'text-nexus-mint' : 'text-slate-200'
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}

          {FEATURES.BOOKLET_LINK ? (
            <li>
              <a
                href={BOOKLET.URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block border-b border-white/5 py-4 text-base font-semibold text-slate-200"
              >
                {BOOKLET.LABEL}
              </a>
            </li>
          ) : null}

          <li className="pt-5">
            <RegisterButton className="w-full justify-center" />
          </li>
        </ul>
      </div>
    </header>
  );
}
