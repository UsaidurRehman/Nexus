import { useState } from 'react';
import Seo from '../../components/common/Seo.jsx';
import AdminShell from '../../components/admin/AdminShell.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import { Banner, Field, Spinner, TextArea, TextInput } from '../../components/admin/FormControls.jsx';
import {
  useCategories,
  useDeleteCategory,
  useDeleteTier,
  useSaveCategory,
  useSaveTier,
  useTiers,
} from '../../hooks/useFestData.js';
import { getTierPresentation } from '../../config.js';

const EMPTY_CATEGORY = { name: '', slug: '', iconName: '', displayOrder: 0 };
const EMPTY_TIER = { tierLevel: '', name: '', description: '', displayOrder: 0 };

export default function AdminTaxonomy() {
  const tiersQuery = useTiers();
  const categoriesQuery = useCategories();
  const saveCategory = useSaveCategory();
  const deleteCategory = useDeleteCategory();
  const saveTier = useSaveTier();
  const deleteTier = useDeleteTier();

  const [category, setCategory] = useState(EMPTY_CATEGORY);
  const [categoryId, setCategoryId] = useState(null);
  const [tier, setTier] = useState(EMPTY_TIER);
  const [tierId, setTierId] = useState(null);
  const [target, setTarget] = useState(null);

  const updateCategory = (key) => (event) =>
    setCategory((prev) => ({ ...prev, [key]: event.target.value }));
  const updateTier = (key) => (event) =>
    setTier((prev) => ({ ...prev, [key]: event.target.value }));

  const resetCategory = () => {
    setCategory(EMPTY_CATEGORY);
    setCategoryId(null);
  };
  const resetTier = () => {
    setTier(EMPTY_TIER);
    setTierId(null);
  };

  const submitCategory = (event) => {
    event.preventDefault();
    if (!category.name.trim()) return;
    saveCategory.mutate(
      {
        id: categoryId,
        payload: {
          name: category.name.trim(),
          slug: category.slug.trim() || null,
          iconName: category.iconName.trim() || null,
          displayOrder: Number(category.displayOrder) || 0,
        },
      },
      { onSuccess: resetCategory },
    );
  };

  const submitTier = (event) => {
    event.preventDefault();
    if (!tier.name.trim() || !tier.tierLevel) return;
    saveTier.mutate(
      {
        id: tierId,
        payload: {
          tierLevel: Number(tier.tierLevel),
          name: tier.name.trim(),
          description: tier.description.trim() || null,
          displayOrder: Number(tier.displayOrder) || 0,
        },
      },
      { onSuccess: resetTier },
    );
  };

  const confirmDelete = () => {
    if (!target) return;
    const onSuccess = () => setTarget(null);
    if (target.kind === 'category') deleteCategory.mutate(target.id, { onSuccess });
    else deleteTier.mutate(target.id, { onSuccess });
  };

  const deleting = deleteCategory.isPending || deleteTier.isPending;
  const deleteError = deleteCategory.error || deleteTier.error;

  return (
    <AdminShell
      title="Tiers & Categories"
      description="The taxonomy that drives grouping and filtering on the public catalog."
    >
      <Seo title="Tiers and categories" noIndex />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ---------------- Categories ---------------- */}
        <section className="grid gap-4">
          <form onSubmit={submitCategory} className="nx-surface p-5 sm:p-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-nexus-mint">
              {categoryId ? 'Edit category' : 'New category'}
            </h2>
            <div className="mt-5 grid gap-4">
              {saveCategory.isError ? (
                <Banner tone="error">{saveCategory.error?.message}</Banner>
              ) : null}

              <Field label="Name" required>
                <TextInput
                  value={category.name}
                  onChange={updateCategory('name')}
                  maxLength={100}
                  placeholder="Programming & Software"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Slug" hint="Auto-generated if blank.">
                  <TextInput
                    value={category.slug}
                    onChange={updateCategory('slug')}
                    maxLength={120}
                  />
                </Field>
                <Field label="Display order">
                  <TextInput
                    type="number"
                    min={0}
                    value={category.displayOrder}
                    onChange={updateCategory('displayOrder')}
                  />
                </Field>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saveCategory.isPending}
                  className="nx-btn nx-btn-primary inline-flex items-center gap-2 text-sm"
                >
                  {saveCategory.isPending ? <Spinner className="h-4 w-4" /> : null}
                  {categoryId ? 'Save category' : 'Add category'}
                </button>
                {categoryId ? (
                  <button type="button" onClick={resetCategory} className="nx-btn nx-btn-ghost text-sm">
                    Cancel
                  </button>
                ) : null}
              </div>
            </div>
          </form>

          <div className="nx-surface divide-y divide-white/[0.06] overflow-hidden">
            {categoriesQuery.isLoading ? (
              <div className="grid place-items-center py-12">
                <Spinner className="h-6 w-6" />
              </div>
            ) : null}
            {(categoriesQuery.data || []).map((item) => (
              <div key={item.categoryId} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{item.name}</p>
                  <p className="truncate text-xs text-white/35">/{item.slug}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {item.eventCount ? (
                    <span className="rounded-full bg-white/8 px-2 py-0.5 text-[11px] tabular-nums text-white/55">
                      {item.eventCount}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryId(item.categoryId);
                      setCategory({
                        name: item.name || '',
                        slug: item.slug || '',
                        iconName: item.iconName || '',
                        displayOrder: item.displayOrder ?? 0,
                      });
                    }}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-nexus-cyan transition hover:bg-nexus-cyan/10"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setTarget({ kind: 'category', id: item.categoryId, label: item.name })
                    }
                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-400/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- Tiers ---------------- */}
        <section className="grid gap-4">
          <form onSubmit={submitTier} className="nx-surface p-5 sm:p-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-nexus-mint">
              {tierId ? 'Edit tier' : 'New tier'}
            </h2>
            <div className="mt-5 grid gap-4">
              {saveTier.isError ? <Banner tone="error">{saveTier.error?.message}</Banner> : null}

              <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
                <Field label="Level" required hint="1–3">
                  <TextInput
                    type="number"
                    min={1}
                    max={3}
                    value={tier.tierLevel}
                    onChange={updateTier('tierLevel')}
                  />
                </Field>
                <Field label="Name" required>
                  <TextInput value={tier.name} onChange={updateTier('name')} maxLength={80} />
                </Field>
              </div>
              <Field label="Description">
                <TextArea rows={2} value={tier.description} onChange={updateTier('description')} />
              </Field>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saveTier.isPending}
                  className="nx-btn nx-btn-primary inline-flex items-center gap-2 text-sm"
                >
                  {saveTier.isPending ? <Spinner className="h-4 w-4" /> : null}
                  {tierId ? 'Save tier' : 'Add tier'}
                </button>
                {tierId ? (
                  <button type="button" onClick={resetTier} className="nx-btn nx-btn-ghost text-sm">
                    Cancel
                  </button>
                ) : null}
              </div>
            </div>
          </form>

          <div className="nx-surface divide-y divide-white/[0.06] overflow-hidden">
            {(tiersQuery.data || []).map((item) => {
              const presentation = getTierPresentation(item.tierLevel);
              return (
                <div key={item.tierId} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-semibold text-white">
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                        style={{
                          color: presentation.accent,
                          backgroundColor: `${presentation.accent}1f`,
                        }}
                      >
                        Tier {item.tierLevel}
                      </span>
                      {item.name}
                    </p>
                    {item.description ? (
                      <p className="nx-clamp-2 mt-1 text-xs text-white/40">{item.description}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setTierId(item.tierId);
                        setTier({
                          tierLevel: item.tierLevel ?? '',
                          name: item.name || '',
                          description: item.description || '',
                          displayOrder: item.displayOrder ?? 0,
                        });
                      }}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-nexus-cyan transition hover:bg-nexus-cyan/10"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setTarget({ kind: 'tier', id: item.tierId, label: item.name })}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-400/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(target)}
        title={`Delete “${target?.label || ''}”?`}
        message={
          target?.kind === 'tier'
            ? 'Tiers in use by an event cannot be deleted — the API will reject the request.'
            : 'Events in this category will keep working; their category is simply cleared.'
        }
        confirmLabel="Delete"
        busy={deleting}
        onCancel={() => setTarget(null)}
        onConfirm={confirmDelete}
      >
        {deleteError ? <Banner tone="error">{deleteError.message}</Banner> : null}
      </ConfirmDialog>
    </AdminShell>
  );
}
