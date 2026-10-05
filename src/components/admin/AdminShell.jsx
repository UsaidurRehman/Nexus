import { NavLink, useNavigate } from 'react-router-dom';
import { api, BRAND, ROUTES } from '../../config.js';

const LINKS = [
  { to: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard', end: true },
  { to: ROUTES.ADMIN_EVENTS, label: 'Events' },
  { to: ROUTES.ADMIN_COORDINATORS, label: 'Coordinators' },
  { to: ROUTES.ADMIN_TAXONOMY, label: 'Tiers & Categories' },
];

/**
 * Chrome for every admin page: sidebar, header, sign-out.
 * @param {{title: string, description?: string, actions?: React.ReactNode, children: React.ReactNode}} props
 */
export default function AdminShell({ title, description, actions, children }) {
  const navigate = useNavigate();
  const user = api.getCurrentUser();

  const handleSignOut = () => {
    api.logout();
    navigate(ROUTES.ADMIN_LOGIN, { replace: true });
  };

  return (
    <div className="min-h-screen bg-nexus-ink text-white">
      <div className="mx-auto flex max-w-[1500px] flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="shrink-0 border-b border-white/10 bg-nexus-abyss/60 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-3 px-5 py-5 lg:block">
            <NavLink to={ROUTES.HOME} className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-nexus-blue text-lg font-black">
                N
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-bold tracking-wide">{BRAND.NAME}</span>
                <span className="block text-[11px] uppercase tracking-[0.18em] text-nexus-mint">
                  Admin
                </span>
              </span>
            </NavLink>
          </div>

          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-6">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  [
                    'whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition',
                    isActive
                      ? 'bg-nexus-blue text-white shadow-lg shadow-nexus-blue/25'
                      : 'text-white/65 hover:bg-white/5 hover:text-white',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden border-t border-white/10 px-5 py-4 lg:block">
            <p className="text-xs text-white/45">Signed in as</p>
            <p className="truncate text-sm font-semibold">{user?.username || 'admin'}</p>
            <button type="button" onClick={handleSignOut} className="nx-btn nx-btn-ghost mt-3 w-full text-sm">
              Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 px-5 py-8 lg:px-10">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{title}</h1>
              {description ? <p className="mt-1 max-w-2xl text-sm text-white/55">{description}</p> : null}
            </div>
            <div className="flex items-center gap-2">
              {actions}
              <button
                type="button"
                onClick={handleSignOut}
                className="nx-btn nx-btn-ghost text-sm lg:hidden"
              >
                Sign out
              </button>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
