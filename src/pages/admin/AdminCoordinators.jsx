import { useMemo, useState } from 'react';
import Seo from '../../components/common/Seo.jsx';
import AdminShell from '../../components/admin/AdminShell.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import { Banner, Field, Select, Spinner, TextInput } from '../../components/admin/FormControls.jsx';
import {
  useCoordinators,
  useCreateCoordinator,
  useDeleteCoordinator,
  useEvents,
  useUpdateCoordinator,
} from '../../hooks/useFestData.js';

const EMPTY = { fullName: '', role: '', email: '', phone: '', eventId: '', displayOrder: 0 };

export default function AdminCoordinators() {
  const [eventFilter, setEventFilter] = useState('');
  const [draft, setDraft] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [target, setTarget] = useState(null);
  const [errors, setErrors] = useState({});

  const eventsQuery = useEvents({ isActive: undefined, pageSize: 200, sortBy: 'title' });
  const coordinatorsQuery = useCoordinators(eventFilter || undefined);
  const createCoordinator = useCreateCoordinator();
  const updateCoordinator = useUpdateCoordinator();
  const deleteCoordinator = useDeleteCoordinator();

  const events = eventsQuery.data || [];
  const coordinators = coordinatorsQuery.data || [];
  const mutation = editingId ? updateCoordinator : createCoordinator;

  const eventTitleById = useMemo(() => {
    const map = new Map();
    events.forEach((event) => map.set(event.eventId, event.title));
    return map;
  }, [events]);

  const update = (key) => (event) => {
    setDraft((prev) => ({ ...prev, [key]: event.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const resetForm = () => {
    setDraft(EMPTY);
    setEditingId(null);
    setErrors({});
  };

  const startEdit = (coordinator) => {
    setEditingId(coordinator.coordinatorId);
    setDraft({
      fullName: coordinator.fullName || '',
      role: coordinator.role || '',
      email: coordinator.email || '',
      phone: coordinator.phone || '',
      eventId: coordinator.eventId || '',
      displayOrder: coordinator.displayOrder ?? 0,
    });
    setErrors({});
    globalThis.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const next = {};
    if (!draft.fullName.trim()) next.fullName = 'Name is required.';
    if (!draft.eventId) next.eventId = 'Assign this coordinator to an event.';
    if (draft.email && !/^\S+@\S+\.\S+$/.test(draft.email)) next.email = 'Enter a valid email.';
    setErrors(next);
    if (Object.keys(next).length) return;

    const payload = {
      eventId: Number(draft.eventId),
      fullName: draft.fullName.trim(),
      role: draft.role.trim() || null,
      email: draft.email.trim() || null,
      phone: draft.phone.trim() || null,
      displayOrder: Number(draft.displayOrder) || 0,
    };

    if (editingId) {
      updateCoordinator.mutate({ id: editingId, payload }, { onSuccess: resetForm });
    } else {
      createCoordinator.mutate(payload, { onSuccess: resetForm });
    }
  };

  const confirmDelete = () => {
    if (!target) return;
    deleteCoordinator.mutate(target.coordinatorId, { onSuccess: () => setTarget(null) });
  };

  return (
    <AdminShell
      title="Coordinators"
      description="Assign organisers to events. Each event can have more than one coordinator."
    >
      <Seo title="Manage coordinators" noIndex />

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        {/* Form */}
        <form onSubmit={handleSubmit} className="nx-surface h-fit p-5 sm:p-6">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-nexus-mint">
            {editingId ? 'Edit coordinator' : 'Assign a coordinator'}
          </h2>

          <div className="mt-5 grid gap-4">
            {mutation.isError ? <Banner tone="error">{mutation.error?.message}</Banner> : null}

            <Field label="Event" required error={errors.eventId}>
              <Select value={draft.eventId} onChange={update('eventId')} error={errors.eventId}>
                <option value="">Select an event…</option>
                {events.map((event) => (
                  <option key={event.eventId} value={event.eventId}>
                    {event.title}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Full name" required error={errors.fullName}>
              <TextInput
                value={draft.fullName}
                onChange={update('fullName')}
                error={errors.fullName}
                maxLength={120}
                placeholder="Abdullah Khan"
              />
            </Field>

            <Field label="Role" hint="e.g. Lead Coordinator">
              <TextInput value={draft.role} onChange={update('role')} maxLength={80} />
            </Field>

            <Field label="Email" error={errors.email}>
              <TextInput
                type="email"
                value={draft.email}
                onChange={update('email')}
                error={errors.email}
                maxLength={150}
              />
            </Field>

            <Field label="Phone" hint="Local format, e.g. 03001234567.">
              <TextInput value={draft.phone} onChange={update('phone')} maxLength={30} />
            </Field>

            <Field label="Display order" hint="Lower numbers appear first.">
              <TextInput
                type="number"
                min={0}
                value={draft.displayOrder}
                onChange={update('displayOrder')}
              />
            </Field>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="nx-btn nx-btn-primary inline-flex flex-1 items-center justify-center gap-2 text-sm"
              >
                {mutation.isPending ? <Spinner className="h-4 w-4" /> : null}
                {editingId ? 'Save' : 'Assign'}
              </button>
              {editingId ? (
                <button type="button" onClick={resetForm} className="nx-btn nx-btn-ghost text-sm">
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        </form>

        {/* List */}
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Select
              value={eventFilter}
              onChange={(event) => setEventFilter(event.target.value)}
              aria-label="Filter coordinators by event"
            >
              <option value="">All events</option>
              {events.map((event) => (
                <option key={event.eventId} value={event.eventId}>
                  {event.title}
                </option>
              ))}
            </Select>
            <span className="text-xs text-white/40">
              {coordinators.length} coordinator{coordinators.length === 1 ? '' : 's'}
            </span>
          </div>

          {coordinatorsQuery.isError ? (
            <Banner tone="error">{coordinatorsQuery.error?.message}</Banner>
          ) : null}

          {coordinatorsQuery.isLoading ? (
            <div className="grid place-items-center py-20">
              <Spinner className="h-8 w-8" />
            </div>
          ) : null}

          {!coordinatorsQuery.isLoading && coordinators.length === 0 ? (
            <div className="nx-surface grid place-items-center p-12 text-center">
              <p className="text-sm text-white/55">No coordinators assigned yet.</p>
            </div>
          ) : null}

          <div className="grid gap-3">
            {coordinators.map((coordinator) => (
              <article
                key={coordinator.coordinatorId}
                className="nx-surface flex flex-wrap items-start justify-between gap-4 p-4"
              >
                <div className="min-w-0">
                  <h3 className="font-semibold text-white">{coordinator.fullName}</h3>
                  {coordinator.role ? (
                    <p className="text-xs uppercase tracking-[0.1em] text-nexus-mint">
                      {coordinator.role}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-white/40">
                    {coordinator.eventTitle || eventTitleById.get(coordinator.eventId) || '—'}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/55">
                    {coordinator.email ? <span>{coordinator.email}</span> : null}
                    {coordinator.phone ? <span>{coordinator.phone}</span> : null}
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => startEdit(coordinator)}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-nexus-cyan transition hover:bg-nexus-cyan/10"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setTarget(coordinator)}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-400/10"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(target)}
        title={`Remove ${target?.fullName || ''}?`}
        message="This unassigns the coordinator from the event. The action cannot be undone."
        confirmLabel="Remove"
        busy={deleteCoordinator.isPending}
        onCancel={() => setTarget(null)}
        onConfirm={confirmDelete}
      >
        {deleteCoordinator.isError ? (
          <Banner tone="error">{deleteCoordinator.error?.message}</Banner>
        ) : null}
      </ConfirmDialog>
    </AdminShell>
  );
}
