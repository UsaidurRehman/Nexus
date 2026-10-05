import { Link } from 'react-router-dom';
import Seo from '../../components/common/Seo.jsx';
import AdminShell from '../../components/admin/AdminShell.jsx';
import { Banner, Spinner } from '../../components/admin/FormControls.jsx';
import { useDashboardStats } from '../../hooks/useFestData.js';
import { ROUTES, formatEntryFee, formatTierLabel, getTierPresentation } from '../../config.js';

function StatCard({ label, value, caption, accent = 'text-nexus-mint' }) {
  return (
    <div className="nx-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">{label}</p>
      <p className={`mt-2 text-3xl font-black tabular-nums ${accent}`}>{value}</p>
      {caption ? <p className="mt-1 text-xs text-white/40">{caption}</p> : null}
    </div>
  );
}

function BarRow({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="truncate font-medium text-white/80">{label}</span>
        <span className="shrink-0 tabular-nums text-white/50">
          {value} <span className="text-white/25">· {pct}%</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

const CATEGORY_COLORS = [
  '#0531D8',
  '#12A4D9',
  '#4FCCA8',
  '#7DFBA4',
  '#8A95E8',
  '#0B4FE8',
  '#B4BFFD',
];

export default function AdminDashboard() {
  const { data, isLoading, isError, error } = useDashboardStats();

  const tiers = data?.byTier || [];
  const categories = data?.byCategory || [];
  const tierTotal = tiers.reduce((sum, t) => sum + (t.count || 0), 0);
  const categoryTotal = categories.reduce((sum, c) => sum + (c.count || 0), 0);

  return (
    <AdminShell
      title="Dashboard"
      description="Live totals pulled from the Nexus API."
      actions={
        <Link to={ROUTES.ADMIN_EVENT_NEW} className="nx-btn nx-btn-primary text-sm">
          + New event
        </Link>
      }
    >
      <Seo title="Admin dashboard" noIndex />

      {isLoading ? (
        <div className="grid place-items-center py-24">
          <Spinner className="h-8 w-8" />
        </div>
      ) : null}

      {isError ? <Banner tone="error">{error?.message}</Banner> : null}

      {data ? (
        <div className="grid gap-6">
          {/* Headline numbers */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Active events"
              value={data.activeEvents ?? 0}
              caption={`${data.totalEvents ?? 0} total including hidden`}
            />
            <StatCard
              label="Featured"
              value={data.featuredEvents ?? 0}
              caption="Highlighted on the public catalog"
              accent="text-nexus-cyan"
            />
            <StatCard
              label="Coordinators"
              value={data.totalCoordinators ?? 0}
              caption="Assigned across all events"
              accent="text-nexus-lilac"
            />
            <StatCard
              label="Unassigned"
              value={data.eventsWithoutCoordinator ?? 0}
              caption={
                data.averageEntryFee
                  ? `Average entry fee ${formatEntryFee(Math.round(data.averageEntryFee))}`
                  : 'Events with no coordinator yet'
              }
              accent={
                (data.eventsWithoutCoordinator ?? 0) > 0 ? 'text-amber-300' : 'text-nexus-peri'
              }
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Tier split */}
            <section className="nx-surface p-5 sm:p-6">
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-nexus-mint">
                Events by tier
              </h2>
              <div className="mt-5 grid gap-4">
                {tiers.length === 0 ? (
                  <p className="text-sm text-white/40">No tier data.</p>
                ) : (
                  tiers.map((tier) => {
                    const presentation = getTierPresentation(tier.tierLevel);
                    return (
                      <BarRow
                        key={tier.tierLevel}
                        label={formatTierLabel(tier.tierLevel, tier.tierName)}
                        value={tier.count || 0}
                        total={tierTotal}
                        color={presentation.accent}
                      />
                    );
                  })
                )}
              </div>
            </section>

            {/* Category split */}
            <section className="nx-surface p-5 sm:p-6">
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-nexus-mint">
                Events by category
              </h2>
              <div className="mt-5 grid gap-4">
                {categories.length === 0 ? (
                  <p className="text-sm text-white/40">No category data.</p>
                ) : (
                  categories.map((category, index) => (
                    <BarRow
                      key={category.category}
                      label={category.category}
                      value={category.count || 0}
                      total={categoryTotal}
                      color={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Shortcuts */}
          <section className="nx-surface p-5 sm:p-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-nexus-mint">
              Quick actions
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to={ROUTES.ADMIN_EVENT_NEW} className="nx-btn nx-btn-primary text-sm">
                Create event
              </Link>
              <Link to={ROUTES.ADMIN_EVENTS} className="nx-btn nx-btn-ghost text-sm">
                Manage events
              </Link>
              <Link to={ROUTES.ADMIN_COORDINATORS} className="nx-btn nx-btn-ghost text-sm">
                Assign coordinators
              </Link>
              <Link to={ROUTES.EVENTS} className="nx-btn nx-btn-ghost text-sm">
                View public catalog
              </Link>
            </div>
          </section>
        </div>
      ) : null}
    </AdminShell>
  );
}
