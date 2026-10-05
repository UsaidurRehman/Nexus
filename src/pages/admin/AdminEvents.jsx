import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../../components/common/Seo.jsx';
import AdminShell from '../../components/admin/AdminShell.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import { Banner, Checkbox, Select, Spinner, TextInput } from '../../components/admin/FormControls.jsx';
import {
  useCategories,
  useDeleteEvent,
  useEventsPaged,
  useTiers,
} from '../../hooks/useFestData.js';
import {
  ROUTES,
  formatEntryFee,
  formatTeamSize,
  formatTierLabel,
  getTierPresentation,
} from '../../config.js';

const PAGE_SIZE = 20;

export default function AdminEvents() {
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [includeHidden, setIncludeHidden] = useState(true);
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState(null);
  const [hardDelete, setHardDelete] = useState(false);

  const tiersQuery = useTiers();
  const categoriesQuery = useCategories();
  const deleteEvent = useDeleteEvent();

  // Server-side filtering: the API does the work, not the browser.
  const params = useMemo(
    () => ({
      search: search.trim() || undefined,
      tier: tier || undefined,
      categoryId: categoryId || undefined,
      isActive: includeHidden ? undefined : true,
      sortBy: 'order',
      page,
      pageSize: PAGE_SIZE,
    }),
    [search, tier, categoryId, includeHidden, page],
  );

  const { data, isLoading, isFetching, isError, error } = useEventsPaged(params);
  const events = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const resetToFirstPage = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const closeDialog = () => {
    setTarget(null);
    setHardDelete(false);
  };

  const confirmDelete = () => {
    if (!target) return;
    deleteEvent.mutate(
      { id: target.eventId, hard: hardDelete },
      { onSuccess: closeDialog },
    );
  };

  return (
    <AdminShell
      title="Events"
      description="Create, edit, hide or remove competitions. Filters run server-side against the API."
      actions={
        <Link to={ROUTES.ADMIN_EVENT_NEW} className="nx-btn nx-btn-primary text-sm">
          + New event
        </Link>
      }
    >
      <Seo title="Manage events" noIndex />

      {/* Filters */}
      <div className="nx-surface mb-6 grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_auto]">
        <TextInput
          type="search"
          placeholder="Search title, summary or description…"
          value={search}
          onChange={(event) => resetToFirstPage(setSearch)(event.target.value)}
          aria-label="Search events"
        />

        <Select
          value={tier}
          onChange={(event) => resetToFirstPage(setTier)(event.target.value)}
          aria-label="Filter by tier"
        >
          <option value="">All tiers</option>
          {(tiersQuery.data || []).map((item) => (
            <option key={item.tierId} value={item.tierLevel}>
              {formatTierLabel(item.tierLevel, item.name)}
            </option>
          ))}
        </Select>

        <Select
          value={categoryId}
          onChange={(event) => resetToFirstPage(setCategoryId)(event.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {(categoriesQuery.data || []).map((item) => (
            <option key={item.categoryId} value={item.categoryId}>
              {item.name}
            </option>
          ))}
        </Select>

        <label className="flex items-center gap-2 whitespace-nowrap text-sm text-white/65">
          <input
            type="checkbox"
            checked={includeHidden}
            onChange={(event) => resetToFirstPage(setIncludeHidden)(event.target.checked)}
            className="h-4 w-4 accent-nexus-blue"
          />
          Show hidden
        </label>
      </div>

      {isError ? <Banner tone="error">{error?.message}</Banner> : null}

      {isLoading ? (
        <div className="grid place-items-center py-24">
          <Spinner className="h-8 w-8" />
        </div>
      ) : null}

      {!isLoading && events.length === 0 ? (
        <div className="nx-surface grid place-items-center p-12 text-center">
          <p className="text-sm text-white/55">No events match these filters.</p>
        </div>
      ) : null}

      {events.length > 0 ? (
        <>
          <div className={`nx-surface overflow-hidden ${isFetching ? 'opacity-60' : ''} transition-opacity`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-[0.1em] text-white/45">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Event</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">Tier</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Team</th>
                    <th className="px-4 py-3 font-semibold">Fee</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {events.map((event) => {
                    const presentation = getTierPresentation(event.tierLevel);
                    return (
                      <tr key={event.eventId} className="transition hover:bg-white/[0.03]">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-white">{event.title}</div>
                          <div className="text-xs text-white/35">/{event.slug}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold"
                            style={{
                              color: presentation.accent,
                              backgroundColor: `${presentation.accent}1f`,
                            }}
                          >
                            Tier {event.tierLevel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white/65">{event.categoryName || '—'}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-white/65">
                          {formatTeamSize(event.minTeamSize, event.maxTeamSize) || '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-white/65">
                          {formatEntryFee(event.entryFee) || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            <span
                              className={[
                                'rounded-full px-2 py-0.5 text-[11px] font-bold',
                                event.isActive
                                  ? 'bg-nexus-mint/15 text-nexus-mint'
                                  : 'bg-white/10 text-white/45',
                              ].join(' ')}
                            >
                              {event.isActive ? 'Live' : 'Hidden'}
                            </span>
                            {event.isFeatured ? (
                              <span className="rounded-full bg-nexus-cyan/15 px-2 py-0.5 text-[11px] font-bold text-nexus-cyan">
                                Featured
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1.5">
                            <Link
                              to={ROUTES.ADMIN_EVENT_EDIT(event.eventId)}
                              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-nexus-cyan transition hover:bg-nexus-cyan/10"
                            >
                              Edit
                            </Link>
                            <button
                              type="button"
                              onClick={() => setTarget(event)}
                              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-400/10"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-white/45">
              Showing {events.length} of {totalCount} event{totalCount === 1 ? '' : 's'}
            </p>
            {totalPages > 1 ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="nx-btn nx-btn-ghost text-sm"
                  disabled={page <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  Previous
                </button>
                <span className="text-xs tabular-nums text-white/50">
                  Page {page} / {totalPages}
                </span>
                <button
                  type="button"
                  className="nx-btn nx-btn-ghost text-sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      <ConfirmDialog
        open={Boolean(target)}
        title={`Delete “${target?.title || ''}”?`}
        message={
          hardDelete
            ? 'This permanently removes the event, its rules and its coordinators. The API rejects a hard delete if registrations exist.'
            : 'The event will be hidden from the public catalog but kept in the database. You can restore it later by re-activating it.'
        }
        confirmLabel={hardDelete ? 'Delete permanently' : 'Hide event'}
        busy={deleteEvent.isPending}
        onCancel={closeDialog}
        onConfirm={confirmDelete}
      >
        <div className="grid gap-3">
          <Checkbox
            label="Permanently delete (hard delete)"
            description="Leave unchecked for a reversible soft delete."
            checked={hardDelete}
            onChange={(event) => setHardDelete(event.target.checked)}
          />
          {deleteEvent.isError ? <Banner tone="error">{deleteEvent.error?.message}</Banner> : null}
        </div>
      </ConfirmDialog>
    </AdminShell>
  );
}
