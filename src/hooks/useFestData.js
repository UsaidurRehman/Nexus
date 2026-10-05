/**
 * Data hooks. These are the ONLY consumers of `api.*` and `QUERY_KEYS`.
 * Components use the hooks; nobody touches HTTP or endpoint strings directly.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, QUERY_KEYS } from '../config.js';

// =====================================================================
//  PUBLIC READS
// =====================================================================

export function useFestInfo() {
  return useQuery({
    queryKey: QUERY_KEYS.fest(),
    queryFn: () => api.getFestInfo(),
  });
}

export function useTiers() {
  return useQuery({
    queryKey: QUERY_KEYS.tiers(),
    queryFn: () => api.getTiers(),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.categories(),
    queryFn: () => api.getCategories(),
  });
}

export function useFaqs() {
  return useQuery({
    queryKey: QUERY_KEYS.faqs(),
    queryFn: () => api.getFaqs(),
  });
}

/** POST /contact — public enquiry form. */
export function useSubmitContact() {
  return useMutation({
    mutationFn: (payload) => api.submitContactMessage(payload),
  });
}

export function useOrganisingTeam() {
  return useQuery({
    queryKey: QUERY_KEYS.team(),
    queryFn: () => api.getOrganisingTeam(),
  });
}

/**
 * Public catalog list. Filters are applied SERVER-side by the API
 * (tier, category, search, featured, fee range, team size).
 */
export function useEvents(params = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.events(params),
    queryFn: () => api.getEvents(params),
    placeholderData: (previous) => previous,
  });
}

export function useEventsPaged(params = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.eventsPaged(params),
    queryFn: () => api.getEventsPaged(params),
    placeholderData: (previous) => previous,
  });
}

export function useEvent(slug) {
  return useQuery({
    queryKey: QUERY_KEYS.eventDetail(slug),
    queryFn: () => api.getEventBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useEventById(id) {
  return useQuery({
    queryKey: QUERY_KEYS.eventById(id),
    queryFn: () => api.getEventById(id),
    enabled: Boolean(id),
  });
}

export function useCoordinators(eventId) {
  return useQuery({
    queryKey: QUERY_KEYS.coordinators(eventId),
    queryFn: () => api.getCoordinators(eventId),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: QUERY_KEYS.stats(),
    queryFn: () => api.getDashboardStats(),
  });
}

// =====================================================================
//  ADMIN MUTATIONS
//  Every mutation invalidates the caches it can affect, so lists and
//  detail pages refresh without a manual reload.
// =====================================================================

function useInvalidateEvents() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['events'] });
    qc.invalidateQueries({ queryKey: ['events-paged'] });
    qc.invalidateQueries({ queryKey: ['admin-stats'] });
    qc.invalidateQueries({ queryKey: ['tiers'] });
    qc.invalidateQueries({ queryKey: ['categories'] });
  };
}

export function useCreateEvent() {
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: (payload) => api.createEvent(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: ({ id, payload }) => api.updateEvent(id, payload),
    onSuccess: (data) => {
      invalidate();
      qc.invalidateQueries({ queryKey: QUERY_KEYS.eventById(data?.eventId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.eventDetail(data?.slug) });
    },
  });
}

export function useDeleteEvent() {
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: ({ id, hard = false }) => api.deleteEvent(id, hard),
    onSuccess: invalidate,
  });
}

function useInvalidateCoordinators() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['coordinators'] });
    qc.invalidateQueries({ queryKey: ['admin-stats'] });
    qc.invalidateQueries({ queryKey: ['event-id'] });
    qc.invalidateQueries({ queryKey: ['event'] });
  };
}

export function useCreateCoordinator() {
  const invalidate = useInvalidateCoordinators();
  return useMutation({
    mutationFn: (payload) => api.createCoordinator(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateCoordinator() {
  const invalidate = useInvalidateCoordinators();
  return useMutation({
    mutationFn: ({ id, payload }) => api.updateCoordinator(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteCoordinator() {
  const invalidate = useInvalidateCoordinators();
  return useMutation({
    mutationFn: (id) => api.deleteCoordinator(id),
    onSuccess: invalidate,
  });
}

function useInvalidateTaxonomy() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['tiers'] });
    qc.invalidateQueries({ queryKey: ['categories'] });
    qc.invalidateQueries({ queryKey: ['admin-stats'] });
  };
}

export function useSaveCategory() {
  const invalidate = useInvalidateTaxonomy();
  return useMutation({
    mutationFn: ({ id, payload }) =>
      id ? api.updateCategory(id, payload) : api.createCategory(payload),
    onSuccess: invalidate,
  });
}

export function useDeleteCategory() {
  const invalidate = useInvalidateTaxonomy();
  return useMutation({
    mutationFn: (id) => api.deleteCategory(id),
    onSuccess: invalidate,
  });
}

export function useSaveTier() {
  const invalidate = useInvalidateTaxonomy();
  return useMutation({
    mutationFn: ({ id, payload }) => (id ? api.updateTier(id, payload) : api.createTier(payload)),
    onSuccess: invalidate,
  });
}

export function useDeleteTier() {
  const invalidate = useInvalidateTaxonomy();
  return useMutation({
    mutationFn: (id) => api.deleteTier(id),
    onSuccess: invalidate,
  });
}

// =====================================================================
//  AUTH
// =====================================================================

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (credentials) => api.login(credentials),
    onSuccess: () => qc.clear(),
  });
}
