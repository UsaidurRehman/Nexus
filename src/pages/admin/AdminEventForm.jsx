import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Seo from '../../components/common/Seo.jsx';
import AdminShell from '../../components/admin/AdminShell.jsx';
import {
  Banner,
  Checkbox,
  Field,
  FormSection,
  Select,
  Spinner,
  TextArea,
  TextInput,
} from '../../components/admin/FormControls.jsx';
import {
  useCategories,
  useCreateEvent,
  useEventById,
  useTiers,
  useUpdateEvent,
} from '../../hooks/useFestData.js';
import { ROUTES, formatTierLabel } from '../../config.js';

const EMPTY_FORM = {
  title: '',
  slug: '',
  tierId: '',
  categoryId: '',
  shortSummary: '',
  description: '',
  durationText: '',
  minTeamSize: 1,
  maxTeamSize: 1,
  entryFee: '',
  prizeInfo: '',
  prizePool: '',
  winnerPrize: '',
  runnerUpPrize: '',
  imageUrl: '',
  isFeatured: false,
  isActive: true,
  rules: [],
};

export default function AdminEventForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const tiersQuery = useTiers();
  const categoriesQuery = useCategories();
  const existing = useEventById(isEdit ? Number(id) : undefined);
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // Hydrate the form once the event arrives.
  useEffect(() => {
    const event = existing.data;
    if (!event) return;
    setForm({
      title: event.title || '',
      slug: event.slug || '',
      tierId: event.tierId || '',
      categoryId: event.categoryId || '',
      shortSummary: event.shortSummary || '',
      description: event.description || '',
      durationText: event.durationText || '',
      minTeamSize: event.minTeamSize ?? 1,
      maxTeamSize: event.maxTeamSize ?? 1,
      entryFee: event.entryFee ?? '',
      prizeInfo: event.prizeInfo || '',
      prizePool: event.prizePool || '',
      winnerPrize: event.winnerPrize || '',
      runnerUpPrize: event.runnerUpPrize || '',
      imageUrl: event.imageUrl || '',
      isFeatured: Boolean(event.isFeatured),
      isActive: event.isActive !== false,
      rules: (event.rules || []).map((rule) => ({ ruleText: rule.ruleText || rule.text || '' })),
    });
  }, [existing.data]);

  const update = (key) => (event) => {
    const value =
      event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const updateRule = (index, value) =>
    setForm((prev) => ({
      ...prev,
      rules: prev.rules.map((rule, i) => (i === index ? { ruleText: value } : rule)),
    }));

  const addRule = () =>
    setForm((prev) => ({ ...prev, rules: [...prev.rules, { ruleText: '' }] }));

  const removeRule = (index) =>
    setForm((prev) => ({ ...prev, rules: prev.rules.filter((_, i) => i !== index) }));

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required.';
    if (!form.tierId) next.tierId = 'Pick a tier.';
    const min = Number(form.minTeamSize);
    const max = Number(form.maxTeamSize);
    if (!Number.isFinite(min) || min < 1) next.minTeamSize = 'Must be at least 1.';
    if (!Number.isFinite(max) || max < 1) next.maxTeamSize = 'Must be at least 1.';
    if (min > max) next.maxTeamSize = 'Maximum cannot be smaller than the minimum.';
    if (form.entryFee !== '' && Number(form.entryFee) < 0) {
      next.entryFee = 'Fee cannot be negative.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const mutation = isEdit ? updateEvent : createEvent;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    const onSuccess = () => navigate(ROUTES.ADMIN_EVENTS);

    if (isEdit) {
      updateEvent.mutate({ id: Number(id), payload: form }, { onSuccess });
    } else {
      createEvent.mutate(form, { onSuccess });
    }
  };

  if (isEdit && existing.isLoading) {
    return (
      <AdminShell title="Edit event">
        <div className="grid place-items-center py-24">
          <Spinner className="h-8 w-8" />
        </div>
      </AdminShell>
    );
  }

  if (isEdit && existing.isError) {
    return (
      <AdminShell title="Edit event">
        <Banner tone="error">{existing.error?.message}</Banner>
        <Link to={ROUTES.ADMIN_EVENTS} className="nx-btn nx-btn-ghost mt-4 text-sm">
          Back to events
        </Link>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={isEdit ? 'Edit event' : 'New event'}
      description={
        isEdit
          ? 'Changes go live on the public catalog as soon as you save.'
          : 'Leave the slug blank and the API will generate one from the title.'
      }
      actions={
        <Link to={ROUTES.ADMIN_EVENTS} className="nx-btn nx-btn-ghost text-sm">
          Cancel
        </Link>
      }
    >
      <Seo title={isEdit ? 'Edit event' : 'New event'} noIndex />

      <form onSubmit={handleSubmit} className="grid max-w-4xl gap-6">
        {mutation.isError ? <Banner tone="error">{mutation.error?.message}</Banner> : null}

        <FormSection title="Basics" description="What the event is called and where it sits.">
          <Field label="Title" required error={errors.title}>
            <TextInput
              value={form.title}
              onChange={update('title')}
              error={errors.title}
              maxLength={150}
              placeholder="e.g. Code Relay"
            />
          </Field>

          <Field
            label="Slug"
            hint="URL fragment. Leave blank to auto-generate from the title."
            error={errors.slug}
          >
            <TextInput
              value={form.slug}
              onChange={update('slug')}
              maxLength={160}
              placeholder="code-relay"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tier" required error={errors.tierId}>
              <Select value={form.tierId} onChange={update('tierId')} error={errors.tierId}>
                <option value="">Select a tier…</option>
                {(tiersQuery.data || []).map((tier) => (
                  <option key={tier.tierId} value={tier.tierId}>
                    {formatTierLabel(tier.tierLevel, tier.name)}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Category" hint="Optional. Used by the public filter chips.">
              <Select value={form.categoryId} onChange={update('categoryId')}>
                <option value="">No category</option>
                {(categoriesQuery.data || []).map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Short summary" hint="One line shown on the catalog card.">
            <TextArea
              rows={2}
              value={form.shortSummary}
              onChange={update('shortSummary')}
              maxLength={300}
              placeholder="A relay-style competitive programming sprint."
            />
          </Field>

          <Field label="Full description" hint="Shown on the event detail page.">
            <TextArea rows={6} value={form.description} onChange={update('description')} />
          </Field>
        </FormSection>

        <FormSection title="Participation" description="Team limits, duration and entry fee.">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Min team size" required error={errors.minTeamSize}>
              <TextInput
                type="number"
                min={1}
                value={form.minTeamSize}
                onChange={update('minTeamSize')}
                error={errors.minTeamSize}
              />
            </Field>
            <Field label="Max team size" required error={errors.maxTeamSize}>
              <TextInput
                type="number"
                min={1}
                value={form.maxTeamSize}
                onChange={update('maxTeamSize')}
                error={errors.maxTeamSize}
              />
            </Field>
            <Field label="Entry fee (PKR)" hint="Blank = free." error={errors.entryFee}>
              <TextInput
                type="number"
                min={0}
                step="1"
                value={form.entryFee}
                onChange={update('entryFee')}
                error={errors.entryFee}
                placeholder="0"
              />
            </Field>
          </div>

          <Field label="Duration" hint="Free text, e.g. “3 hours” or “2 days”.">
            <TextInput
              value={form.durationText}
              onChange={update('durationText')}
              maxLength={100}
              placeholder="3 hours"
            />
          </Field>
        </FormSection>

        <FormSection title="Prizes" description="Anything left blank is hidden on the public site.">
          <Field label="Prize summary">
            <TextArea rows={2} value={form.prizeInfo} onChange={update('prizeInfo')} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Prize pool">
              <TextInput value={form.prizePool} onChange={update('prizePool')} maxLength={100} />
            </Field>
            <Field label="Winner prize">
              <TextInput value={form.winnerPrize} onChange={update('winnerPrize')} maxLength={100} />
            </Field>
            <Field label="Runner-up prize">
              <TextInput
                value={form.runnerUpPrize}
                onChange={update('runnerUpPrize')}
                maxLength={100}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          title="Rules"
          description="Saving replaces the entire rule list with what you see here."
        >
          {form.rules.length === 0 ? (
            <p className="text-sm text-white/40">No rules yet.</p>
          ) : (
            <ol className="grid gap-2">
              {form.rules.map((rule, index) => (
                /* eslint-disable-next-line react/no-array-index-key */
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-3 w-5 shrink-0 text-right text-xs tabular-nums text-white/35">
                    {index + 1}.
                  </span>
                  <TextArea
                    rows={2}
                    value={rule.ruleText}
                    onChange={(event) => updateRule(index, event.target.value)}
                    placeholder="Rule text…"
                  />
                  <button
                    type="button"
                    onClick={() => removeRule(index)}
                    aria-label={`Remove rule ${index + 1}`}
                    className="mt-1.5 shrink-0 rounded-lg px-2.5 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-400/10"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ol>
          )}
          <button type="button" onClick={addRule} className="nx-btn nx-btn-ghost justify-self-start text-sm">
            + Add rule
          </button>
        </FormSection>

        <FormSection title="Visibility" description="Control where the event appears.">
          <Field label="Image URL" hint="Optional. A gradient monogram is used when empty.">
            <TextInput value={form.imageUrl} onChange={update('imageUrl')} maxLength={300} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Checkbox
              label="Active"
              description="Visible on the public catalog."
              checked={form.isActive}
              onChange={update('isActive')}
            />
            <Checkbox
              label="Featured"
              description="Pinned to the top of its tier."
              checked={form.isFeatured}
              onChange={update('isFeatured')}
            />
          </div>
        </FormSection>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="nx-btn nx-btn-primary inline-flex items-center gap-2"
          >
            {mutation.isPending ? <Spinner className="h-4 w-4" /> : null}
            {isEdit ? 'Save changes' : 'Create event'}
          </button>
          <Link to={ROUTES.ADMIN_EVENTS} className="nx-btn nx-btn-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </AdminShell>
  );
}
