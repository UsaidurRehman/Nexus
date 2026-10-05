/**
 * ===========================================================================
 *  NEXUS TECH FEST — CENTRALIZED APPLICATION CONFIGURATION
 * ===========================================================================
 *
 *  ⚠️  ARCHITECTURAL CONTRACT — READ BEFORE EDITING ANYTHING ELSE
 *
 *  This file is the ONLY place in the entire codebase that is allowed to know:
 *    • the API base URL
 *    • any endpoint path string
 *    • HTTP headers, interceptors, timeouts, retry policy
 *    • the response envelope / casing of the backend
 *    • how errors are shaped and translated
 *    • how relative asset paths resolve
 *    • feature flags and display-formatting business rules
 *
 *  NO component, page or hook may import axios, call fetch(), or hardcode a
 *  URL. They import the exported `api.*` helpers (and the formatters) from
 *  here. Swapping, versioning or re-pointing the backend is therefore always
 *  a single-file change.
 *
 *  ---------------------------------------------------------------------
 *  FILE MAP
 *    1.  ENV ............ environment + runtime switches
 *    2.  FEATURES ....... feature flags (Phase 1 vs deferred scope)
 *    3.  BRAND / SITE ... identity constants used by layout + SEO
 *    4.  ENDPOINTS ...... every API path, as functions. Single source of truth.
 *    5.  HTTP ........... axios instance, headers, interceptors, error mapping
 *    6.  NORMALIZERS .... backend payload -> stable UI model (absorbs drift)
 *    7.  FORMATTERS ..... display business rules (team size, fee, TBA, dates)
 *    8.  MOCK LAYER ..... offline fixture-backed mirror of the API
 *    9.  api.* .......... THE PUBLIC SURFACE. This is what components use.
 *   10.  QUERY KEYS ..... TanStack Query cache keys + policy
 *  ---------------------------------------------------------------------
 */

import axios from 'axios';
import {
  FEST_INFO as MOCK_FEST_INFO,
  TIERS as MOCK_TIERS,
  EVENTS as MOCK_EVENTS,
  EVENT_DETAILS as MOCK_EVENT_EXTRAS,
  CATEGORIES as MOCK_CATEGORIES,
  TEAM_MEMBERS as MOCK_TEAM,
  FAQS as MOCK_FAQS,
} from './mocks/fixtures.js';

/* =========================================================================
 * 1. ENVIRONMENT
 * ========================================================================= */

const readEnv = (key, fallback = '') => {
  const value = import.meta.env?.[key];
  return value === undefined || value === null || value === '' ? fallback : value;
};

const readBool = (key, fallback = false) => {
  const value = readEnv(key, null);
  if (value === null) return fallback;
  return String(value).toLowerCase() === 'true';
};

const readInt = (key, fallback) => {
  const parsed = Number.parseInt(readEnv(key, ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const stripTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');

export const ENV = {
  /** Root of the ASP.NET Core Web API, e.g. https://api.nexus.biit.edu.pk */
  API_BASE_URL: stripTrailingSlash(readEnv('VITE_API_BASE_URL', 'http://localhost:5050')),

  /** API version segment. Bump here to move the whole app to /api/v2. */
  API_VERSION: 'v1',

  /** Master offline switch. true => zero network calls, fixtures only. */
  USE_MOCK_API: readBool('VITE_USE_MOCK_API', false),

  /** Simulated latency while mocking, so loading states are visible. */
  MOCK_LATENCY_MS: readInt('VITE_MOCK_LATENCY_MS', 450),

  /** Per-request timeout. */
  TIMEOUT_MS: readInt('VITE_API_TIMEOUT_MS', 15000),

  /** Prefix for relative image paths from the API. Defaults to the API host. */
  ASSET_BASE_URL: stripTrailingSlash(
    readEnv('VITE_ASSET_BASE_URL', stripTrailingSlash(readEnv('VITE_API_BASE_URL', ''))),
  ),

  /** Public base path, mirrors vite `base`. '/' for root, '/nexus/' for subfolder. */
  PUBLIC_BASE: readEnv('VITE_PUBLIC_BASE', import.meta.env?.BASE_URL || '/'),

  /** Canonical origin for absolute SEO / OpenGraph URLs. */
  SITE_URL: stripTrailingSlash(readEnv('VITE_SITE_URL', '')),

  // Where the Register button sends people once registration opens.
  // TODO: replace with the real registration form URL when it exists.
  REGISTRATION_URL: readEnv('VITE_REGISTRATION_URL', ''),

  // Public Canva booklet. /view (not /edit) so visitors without Canva
  // edit rights can open it.
  BOOKLET_URL: readEnv(
    'VITE_BOOKLET_URL',
    'https://www.canva.com/design/DAHW9UMXS90/SY61va_kjPo_gyZiHoD30Q/view',
  ),

  IS_DEV: Boolean(import.meta.env?.DEV),
  IS_PROD: Boolean(import.meta.env?.PROD),
};

/** React Router basename, derived from PUBLIC_BASE. '/' stays '/'. */
ENV.ROUTER_BASENAME = stripTrailingSlash(ENV.PUBLIC_BASE) || '/';

/* =========================================================================
 * 2. FEATURE FLAGS
 *    Phase 1 is a strict subset. Deferred scope (§3.1b of the design doc)
 *    stays false until the executive signs off — flipping one boolean is the
 *    entire activation cost.
 * ========================================================================= */

export const FEATURES = {
  // --- Phase 1: LIVE ---
  HOME: true,
  EVENTS_LIST: true,
  EVENT_DETAIL: true,
  EVENT_SEARCH: true,
  TIER_JUMP_LINKS: true,
  COUNTDOWN: true,

  // --- Deferred (§3.1b) — awaiting executive approval ---
  ABOUT_PAGE: false,
  SCHEDULE_PAGE: false,
  VENUES_PAGE: false,
  SPONSORS_PAGE: false,
  ANNOUNCEMENTS: false,

  // --- Live against the ASP.NET Core API ---
  CATEGORY_FILTER: true,
  TEAM_PAGE: true,
  FAQS_PAGE: true,
  CONTACT_FORM: true,
  ADMIN_PANEL: true,

  // Registration CTA is now ON. Before REGISTRATION.OPENS_AT it shows a
  // "coming soon" dialog; afterwards it follows REGISTRATION.URL.
  REGISTRATION_CTA: true,
  BOOKLET_LINK: true,

  // Coordinator contact details ARE shown on the event detail page: the seed
  // data publishes them deliberately so participants can reach the organiser.
  SHOW_COORDINATOR_PHONE: true,

  /**
   * Missing / unconfirmed content (no venue, no duration, no prize…) is
   * OMITTED from the UI entirely rather than shown as "To be announced".
   * Set to false to fall back to the TBA_LABEL placeholder instead.
   */
  HIDE_EMPTY_FIELDS: true,
};

/* =========================================================================
 * 3. BRAND / SITE CONSTANTS
 * ========================================================================= */

/** Resolve a file in /public against the deploy base path. */
export const publicAsset = (path) => {
  const base = ENV.PUBLIC_BASE.endsWith('/') ? ENV.PUBLIC_BASE : `${ENV.PUBLIC_BASE}/`;
  return `${base}${String(path).replace(/^\/+/, '')}`;
};

export const BRAND = {
  NAME: 'NEXUS',
  FULL_NAME: 'BIIT Nexus 2026',
  TAGLINE_UR: 'نیا ستارہ',
  ORGANISER: 'BIIT, Rawalpindi',
  LOGO: publicAsset('brand/nexus-logo.png'),
  HERO_BANNER: publicAsset('brand/nexus-hero.jpg'),
  FAVICON: publicAsset('brand/favicon.png'),

  /**
   * Official NEXUS '26 palette, sampled from the Canva design system:
   * the BIIT wordmark asset gives the primary blue, the rendered banner gives
   * the navy -> cyan -> mint range. Mirrored in tailwind.config.js.
   */
  COLORS: {
    ink: '#01061F',
    abyss: '#020A3D',
    navy: '#020B83',
    deep: '#03117E',
    royal: '#021CAB',
    blue: '#0531D8', // BIIT official blue — primary
    azure: '#0B4FE8',
    cyan: '#12A4D9',
    teal: '#4FCCA8',
    green: '#3BE38B',
    mint: '#7DFBA4', // accent
    peri: '#8A95E8',
    lilac: '#B4BFFD',
    paper: '#F7F7FC',
  },
};

export const SITE = {
  DEFAULT_TITLE: 'BIIT Nexus 2026 — Climate Resilience & Sustainability',
  TITLE_TEMPLATE: (page) => (page ? `${page} · BIIT Nexus 2026` : SITE.DEFAULT_TITLE),
  DEFAULT_DESCRIPTION:
    'BIIT Nexus 2026 is a 5-day inter-university regional festival under the theme Climate Resilience & Sustainability. Explore every competition across Tier 1, Tier 2 and Tier 3 — programming, AI, security, mathematics, gaming, sports, Islamic knowledge and cultural arts.',
  LOCALE: 'en_PK',
  /** All fest times are Pakistan Standard Time. Never timezone-convert on the client. */
  TIMEZONE: 'Asia/Karachi',
  TIMEZONE_LABEL: 'PKT',
};

/** Canonical route table. Components link via ROUTES.*, never a literal string. */
/* =========================================================================
 * 3b. REGISTRATION + BOOKLET
 *     All registration timing and destination logic lives here. Components
 *     ask `getRegistrationState()` and render what it returns.
 * ========================================================================= */

export const REGISTRATION = {
  /**
   * Registration opens 1 November 2026, 00:00 Pakistan Standard Time (UTC+5).
   * Written with an explicit offset so the gate behaves identically for a
   * visitor in Karachi and one in London.
   */
  OPENS_AT: '2026-11-01T00:00:00+05:00',

  /** Where Register sends people once open. Empty = not yet configured. */
  URL: ENV.REGISTRATION_URL,

  COMING_SOON_TITLE: 'Registration opens soon',
  COMING_SOON_BODY:
    'Online registration for BIIT Nexus 2026 opens on 1 November 2026. All sign-ups are handled through this portal — paper registration is not accepted.',
};

/** Official Nexus booklet on Canva. */
export const BOOKLET = {
  URL: ENV.BOOKLET_URL,
  LABEL: 'Nexus Booklet',
  DESCRIPTION: 'Full event guide, rules and schedule in one document.',
};

/**
 * Milliseconds until registration opens. Zero or negative means it is open.
 * @param {Date} [now]
 */
export const msUntilRegistrationOpens = (now = new Date()) =>
  new Date(REGISTRATION.OPENS_AT).getTime() - now.getTime();

/** True on or after 1 Nov 2026 PKT. */
export const isRegistrationOpen = (now = new Date()) => msUntilRegistrationOpens(now) <= 0;

/**
 * Everything a Register button needs, resolved in one place.
 * @returns {{open:boolean, href:string|null, label:string, opensAt:Date, msRemaining:number}}
 */
export const getRegistrationState = (now = new Date()) => {
  const msRemaining = msUntilRegistrationOpens(now);
  const open = msRemaining <= 0;
  return {
    open,
    // A missing URL must not render a dead link — fall back to the dialog.
    href: open && REGISTRATION.URL ? REGISTRATION.URL : null,
    label: open ? 'Register now' : 'Register',
    opensAt: new Date(REGISTRATION.OPENS_AT),
    msRemaining: Math.max(0, msRemaining),
  };
};

export const ROUTES = {
  HOME: '/',
  EVENTS: '/events',
  EVENT_DETAIL: (slug = ':slug') => `/events/${slug}`,
  FAQS: '/faqs',
  TEAM: '/team',
  CONTACT: '/contact',

  // --- Admin ---
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_EVENTS: '/admin/events',
  ADMIN_EVENT_NEW: '/admin/events/new',
  ADMIN_EVENT_EDIT: (id = ':id') => `/admin/events/${id}/edit`,
  ADMIN_COORDINATORS: '/admin/coordinators',
  ADMIN_TAXONOMY: '/admin/taxonomy',

  NOT_FOUND: '*',
};

/** Navigation shown in the header, filtered by feature flags. */
export const NAV_LINKS = [
  { label: 'Home', to: ROUTES.HOME, enabled: FEATURES.HOME, end: true },
  { label: 'Events', to: ROUTES.EVENTS, enabled: FEATURES.EVENTS_LIST },
  { label: 'About', to: '/about', enabled: FEATURES.ABOUT_PAGE },
  { label: 'Schedule', to: '/schedule', enabled: FEATURES.SCHEDULE_PAGE },
  { label: 'Sponsors', to: '/sponsors', enabled: FEATURES.SPONSORS_PAGE },
  { label: 'Team', to: ROUTES.TEAM, enabled: FEATURES.TEAM_PAGE },
  { label: 'FAQs', to: ROUTES.FAQS, enabled: FEATURES.FAQS_PAGE },
  { label: 'Contact', to: ROUTES.CONTACT, enabled: FEATURES.CONTACT_FORM },
].filter((link) => link.enabled);

/* =========================================================================
 * 4. ENDPOINTS — every backend path lives here and nowhere else
 * ========================================================================= */

const apiRoot = `/api/${ENV.API_VERSION}`;

const toQueryString = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.append(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
};

export const ENDPOINTS = {
  // ---------------- Auth ----------------
  auth: {
    login: () => `${apiRoot}/auth/login`,
    me: () => `${apiRoot}/auth/me`,
  },

  // ---------------- Content ----------------
  fest: { get: () => `${apiRoot}/fest` },
  faqs: { list: () => `${apiRoot}/faqs` },
  team: { list: () => `${apiRoot}/team` },
  contact: { submit: () => `${apiRoot}/contact` },
  health: { get: () => `${apiRoot}/health` },

  // ---------------- Tiers (full CRUD) ----------------
  tiers: {
    list: () => `${apiRoot}/tiers`,
    byId: (id) => `${apiRoot}/tiers/${id}`,
    create: () => `${apiRoot}/tiers`,
    update: (id) => `${apiRoot}/tiers/${id}`,
    remove: (id) => `${apiRoot}/tiers/${id}`,
  },

  // ---------------- Categories (full CRUD) ----------------
  categories: {
    list: () => `${apiRoot}/categories`,
    byId: (id) => `${apiRoot}/categories/${id}`,
    create: () => `${apiRoot}/categories`,
    update: (id) => `${apiRoot}/categories/${id}`,
    remove: (id) => `${apiRoot}/categories/${id}`,
  },

  // ---------------- Events (full CRUD + filters) ----------------
  events: {
    /**
     * @param {{tier?:number, categoryId?:number, category?:string, search?:string,
     *          featured?:boolean, minFee?:number, maxFee?:number, teamSize?:number,
     *          isActive?:boolean, sortBy?:string, desc?:boolean,
     *          page?:number, pageSize?:number}} params
     */
    list: (params = {}) => `${apiRoot}/events${toQueryString(params)}`,
    byId: (id) => `${apiRoot}/events/${id}`,
    bySlug: (slug) => `${apiRoot}/events/slug/${encodeURIComponent(slug)}`,
    stats: () => `${apiRoot}/events/stats`,
    create: () => `${apiRoot}/events`,
    update: (id) => `${apiRoot}/events/${id}`,
    remove: (id, hard = false) => `${apiRoot}/events/${id}${toQueryString({ hard })}`,
  },

  // ---------------- Coordinators (full CRUD) ----------------
  coordinators: {
    list: (eventId) => `${apiRoot}/coordinators${toQueryString({ eventId })}`,
    byId: (id) => `${apiRoot}/coordinators/${id}`,
    create: () => `${apiRoot}/coordinators`,
    update: (id) => `${apiRoot}/coordinators/${id}`,
    remove: (id) => `${apiRoot}/coordinators/${id}`,
  },

  // ---------------- Deferred scope ----------------
  schedule: { byDay: (day) => `${apiRoot}/schedule${toQueryString({ day })}` },
  venues: { list: () => `${apiRoot}/venues` },
  sponsors: { list: () => `${apiRoot}/sponsors` },
  announcements: { list: () => `${apiRoot}/announcements` },
};

/* =========================================================================
 * 4b. AUTH TOKEN STORE
 *     The ONLY place the JWT is read or written. Components never touch
 *     localStorage directly.
 * ========================================================================= */

const TOKEN_STORAGE_KEY = 'nexus.admin.token';
const USER_STORAGE_KEY = 'nexus.admin.user';

export const authStore = {
  getToken() {
    try {
      return globalThis.localStorage?.getItem(TOKEN_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  },

  getUser() {
    try {
      const raw = globalThis.localStorage?.getItem(USER_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setSession({ token, username, role, expiresAt }) {
    try {
      globalThis.localStorage?.setItem(TOKEN_STORAGE_KEY, token);
      globalThis.localStorage?.setItem(
        USER_STORAGE_KEY,
        JSON.stringify({ username, role, expiresAt }),
      );
    } catch {
      /* storage unavailable (private mode) — session stays in memory only */
    }
  },

  clear() {
    try {
      globalThis.localStorage?.removeItem(TOKEN_STORAGE_KEY);
      globalThis.localStorage?.removeItem(USER_STORAGE_KEY);
    } catch {
      /* no-op */
    }
  },

  /** True when a non-expired token is present. */
  isAuthenticated() {
    const token = authStore.getToken();
    if (!token) return false;
    const user = authStore.getUser();
    if (user?.expiresAt && new Date(user.expiresAt).getTime() < Date.now()) {
      authStore.clear();
      return false;
    }
    return true;
  },
};

/* =========================================================================
 * 5. HTTP LAYER — the one and only axios instance
 * ========================================================================= */

/** Static headers applied to every request. */
export const DEFAULT_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

/**
 * Per-request dynamic headers. Centralised so adding auth later (v2 admin
 * panel) is a change here only — every call site inherits it for free.
 */
const buildDynamicHeaders = () => {
  const headers = {};

  // Correlation id makes a browser error traceable to a Serilog line.
  headers['X-Correlation-Id'] =
    globalThis.crypto?.randomUUID?.() ?? `nx-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  headers['X-Client-App'] = 'nexus-web';

  // Admin JWT, injected centrally so no component ever handles the token.
  const token = authStore.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  return headers;
};

export const httpClient = axios.create({
  baseURL: ENV.API_BASE_URL || undefined,
  timeout: ENV.TIMEOUT_MS,
  headers: { ...DEFAULT_HEADERS },
  withCredentials: false,
});

httpClient.interceptors.request.use((requestConfig) => {
  requestConfig.headers = { ...requestConfig.headers, ...buildDynamicHeaders() };
  if (ENV.IS_DEV) {
    // eslint-disable-next-line no-console
    console.debug(`[api] ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`);
  }
  return requestConfig;
});

/** Normalized error every component can rely on, regardless of transport. */
export class ApiError extends Error {
  constructor({ message, status = null, code = 'UNKNOWN', detail = null, raw = null }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.detail = detail;
    this.raw = raw;
    this.isNotFound = status === 404;
    this.isUnauthorized = status === 401;
    this.isConflict = status === 409;
  }
}

/** Human-readable copy for each failure class. No raw stack traces for visitors. */
const ERROR_MESSAGES = {
  TIMEOUT: 'The server took too long to respond. Please check your connection and try again.',
  NETWORK: 'We could not reach the server. Make sure the API is running.',
  NOT_FOUND: 'We could not find what you were looking for.',
  UNAUTHORIZED: 'Your session has expired. Please sign in again.',
  FORBIDDEN: 'You do not have permission to do that.',
  CONFLICT: 'That action conflicts with existing data.',
  RATE_LIMITED: 'Too many attempts. Please wait a moment and try again.',
  SERVER: 'Something went wrong on our side. Please try again in a moment.',
  CLIENT: 'That request could not be completed.',
  UNKNOWN: 'An unexpected error occurred. Please try again.',
};

/** Translate anything axios throws into a single predictable ApiError. */
const toApiError = (error) => {
  if (error instanceof ApiError) return error;

  if (axios.isCancel?.(error)) {
    return new ApiError({ message: 'Request cancelled.', code: 'CANCELLED', raw: error });
  }
  if (error?.code === 'ECONNABORTED') {
    return new ApiError({ message: ERROR_MESSAGES.TIMEOUT, code: 'TIMEOUT', raw: error });
  }
  if (!error?.response) {
    return new ApiError({ message: ERROR_MESSAGES.NETWORK, code: 'NETWORK', raw: error });
  }

  const { status, data } = error.response;
  // ASP.NET Core ProblemDetails: { type, title, status, detail, traceId }
  const detail = data?.detail || data?.title || null;

  let code = 'UNKNOWN';
  if (status === 404) code = 'NOT_FOUND';
  else if (status === 401) code = 'UNAUTHORIZED';
  else if (status === 403) code = 'FORBIDDEN';
  else if (status === 409) code = 'CONFLICT';
  else if (status === 429) code = 'RATE_LIMITED';
  else if (status >= 500) code = 'SERVER';
  else if (status >= 400) code = 'CLIENT';

  // An expired or invalid token must not leave a half-logged-in UI behind.
  if (status === 401) authStore.clear();

  // For 4xx the API's own title/detail is far more useful than a generic string.
  const serverTitle = data?.title || null;
  const message =
    status >= 400 && status < 500 && serverTitle && status !== 401
      ? serverTitle
      : ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN;

  return new ApiError({ message, status, code, detail, raw: error });
};

httpClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toApiError(error)),
);

/**
 * Unwraps the response body. Tolerates BOTH a bare payload and a
 * `{ success, data, message }` envelope, so a backend decision we have not
 * made yet cannot break the frontend.
 */
const unwrap = (response) => {
  const body = response?.data;
  if (body && typeof body === 'object' && !Array.isArray(body) && 'data' in body) {
    if ('success' in body || 'message' in body) return body.data;
  }
  return body;
};

/** Internal GET used by every api.* reader. */
const get = async (url, options = {}) => unwrap(await httpClient.get(url, options));
const post = async (url, body, options = {}) => unwrap(await httpClient.post(url, body, options));
const put = async (url, body, options = {}) => unwrap(await httpClient.put(url, body, options));
const del = async (url, options = {}) => unwrap(await httpClient.delete(url, options));

/**
 * The events endpoint returns PagedResult&lt;T&gt; = { items, page, pageSize,
 * totalCount, ... }. Everything else returns a bare array. This flattens both
 * into one predictable shape so components never branch on it.
 */
const unwrapPaged = (payload) => {
  if (Array.isArray(payload)) {
    return { items: payload, totalCount: payload.length, page: 1, pageSize: payload.length };
  }
  if (payload && typeof payload === 'object' && Array.isArray(payload.items)) {
    return {
      items: payload.items,
      totalCount: payload.totalCount ?? payload.items.length,
      page: payload.page ?? 1,
      pageSize: payload.pageSize ?? payload.items.length,
      totalPages: payload.totalPages ?? 1,
    };
  }
  return { items: [], totalCount: 0, page: 1, pageSize: 0 };
};

/* =========================================================================
 * 6. NORMALIZERS — backend payload -> stable UI model
 *    Absorbs camelCase/PascalCase drift and guarantees defaults, so a
 *    contract surprise is fixed here instead of in twenty components.
 * ========================================================================= */

/** Reads a field regardless of casing: pick(obj, 'eventId') matches EventId too. */
const pick = (source, key, fallback = null) => {
  if (!source || typeof source !== 'object') return fallback;
  if (source[key] !== undefined) return source[key];
  const pascal = key.charAt(0).toUpperCase() + key.slice(1);
  if (source[pascal] !== undefined) return source[pascal];
  const camel = key.charAt(0).toLowerCase() + key.slice(1);
  if (source[camel] !== undefined) return source[camel];
  return fallback;
};

const asArray = (value) => (Array.isArray(value) ? value : []);

/**
 * Turn a relative image path from the DB into something the browser can load.
 * Absolute URLs and data URIs pass through untouched.
 */
export const resolveAssetUrl = (path) => {
  if (!path) return null;
  const value = String(path).trim();
  if (!value) return null;
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:')) return value;
  if (value.startsWith('/brand/')) return publicAsset(value.slice(1)); // bundled brand assets
  if (!ENV.ASSET_BASE_URL) return value;
  return `${ENV.ASSET_BASE_URL}/${value.replace(/^\/+/, '')}`;
};

/**
 * @typedef {Object} FestInfo
 * @property {string} name
 * @property {string|null} tagline
 * @property {string|null} description
 * @property {string} startDate
 * @property {string} endDate
 * @property {string|null} venueSummary
 */
export const normalizeFestInfo = (raw) => {
  if (!raw) return null;
  return {
    festInfoId: pick(raw, 'festInfoId'),
    name: pick(raw, 'name', BRAND.NAME),
    tagline: pick(raw, 'tagline'),
    description: pick(raw, 'description'),
    startDate: pick(raw, 'startDate'),
    endDate: pick(raw, 'endDate'),
    venueSummary: pick(raw, 'venueSummary'),
    logoUrl: resolveAssetUrl(pick(raw, 'logoUrl')) || BRAND.LOGO,
    bannerUrl: resolveAssetUrl(pick(raw, 'bannerUrl')) || BRAND.HERO_BANNER,
    contactEmail: pick(raw, 'contactEmail'),
    contactPhone: pick(raw, 'contactPhone'),
    instagramUrl: pick(raw, 'instagramUrl'),
    linkedInUrl: pick(raw, 'linkedInUrl'),
    facebookUrl: pick(raw, 'facebookUrl'),

    // Computed server-side by the API.
    executiveHead: pick(raw, 'executiveHead'),
    totalEvents: Number(pick(raw, 'totalEvents', 0)),
    durationDays: Number(pick(raw, 'durationDays', 0)),
  };
};

/**
 * @typedef {Object} Tier
 * @property {number} tierId
 * @property {number} tierLevel
 * @property {string} name
 */
export const normalizeTier = (raw) => {
  if (!raw) return null;
  const level = Number(pick(raw, 'tierLevel', pick(raw, 'tierId', 0)));
  return {
    tierId: Number(pick(raw, 'tierId', level)),
    tierLevel: level,
    // Decision Q4: render the backend's name verbatim ("Tier 1"), never hardcode.
    name: pick(raw, 'name') || `Tier ${level}`,
    description: pick(raw, 'description'),
    displayOrder: Number(pick(raw, 'displayOrder', level)),
  };
};

/**
 * @typedef {Object} Category
 * @property {number} categoryId
 * @property {string} name
 * @property {string} slug
 */
export const normalizeCategory = (raw) => {
  if (!raw) return null;
  return {
    categoryId: Number(pick(raw, 'categoryId', 0)),
    name: pick(raw, 'name', ''),
    slug: pick(raw, 'slug', ''),
    iconName: pick(raw, 'iconName'),
    displayOrder: Number(pick(raw, 'displayOrder', 0)),
    eventCount: Number(pick(raw, 'eventCount', 0)),
  };
};

/**
 * @typedef {Object} Faq
 * @property {number} faqId
 * @property {string} question
 * @property {string} answer
 */
export const normalizeFaq = (raw, index = 0) => {
  if (!raw) return null;
  const question = pick(raw, 'question');
  const answer = pick(raw, 'answer');
  if (!question || !answer) return null;
  return {
    faqId: Number(pick(raw, 'faqId', index + 1)),
    question,
    answer,
    displayOrder: Number(pick(raw, 'displayOrder', index)),
  };
};

/**
 * @typedef {Object} TeamMember
 * @property {number} memberId
 * @property {string} fullName
 * @property {string} role
 */
export const normalizeTeamMember = (raw, index = 0) => {
  if (!raw) return null;
  const fullName = pick(raw, 'fullName');
  if (!fullName) return null;
  return {
    memberId: Number(pick(raw, 'memberId', index + 1)),
    fullName,
    role: pick(raw, 'role'),
    department: pick(raw, 'department'),
    photoUrl: resolveAssetUrl(pick(raw, 'photoUrl')),
    linkedInUrl: pick(raw, 'linkedInUrl'),
    displayOrder: Number(pick(raw, 'displayOrder', index)),
  };
};

export const normalizeEvent = (raw) => {
  if (!raw) return null;
  const minTeamSize = Number(pick(raw, 'minTeamSize', 1)) || 1;
  const maxTeamSizeRaw = Number(pick(raw, 'maxTeamSize', minTeamSize));
  const maxTeamSize = Number.isFinite(maxTeamSizeRaw) ? maxTeamSizeRaw : minTeamSize;
  const entryFeeRaw = pick(raw, 'entryFee');

  return {
    eventId: Number(pick(raw, 'eventId', 0)),
    tierId: Number(pick(raw, 'tierId', 0)),
    tierLevel: Number(pick(raw, 'tierLevel', pick(raw, 'tierId', 0))),
    tierName: pick(raw, 'tierName'),
    categoryId: pick(raw, 'categoryId'),
    category: pick(raw, 'category'),
    categoryName: pick(raw, 'category'),
    venueId: pick(raw, 'venueId'),
    venue: pick(raw, 'venue'),
    title: pick(raw, 'title', 'Untitled event'),
    slug: pick(raw, 'slug', ''),
    shortSummary: pick(raw, 'shortSummary'),
    description: pick(raw, 'description'),
    imageUrl: resolveAssetUrl(pick(raw, 'imageUrl')),
    durationText: pick(raw, 'durationText'),
    minTeamSize,
    maxTeamSize: Math.max(minTeamSize, maxTeamSize),
    prizeInfo: pick(raw, 'prizeInfo'),
    entryFee: entryFeeRaw === null || entryFeeRaw === undefined ? null : Number(entryFeeRaw),
    isFeatured: Boolean(pick(raw, 'isFeatured', false)),
    isActive: pick(raw, 'isActive') === undefined ? true : Boolean(pick(raw, 'isActive')),
    displayOrder: Number(pick(raw, 'displayOrder', 0)),

    // Columns added by ALTER TABLE in the supplied schema
    prizePool: pick(raw, 'prizePool'),
    winnerPrize: pick(raw, 'winnerPrize'),
    runnerUpPrize: pick(raw, 'runnerUpPrize'),
    managerName: pick(raw, 'managerName'),
    managerEmail: pick(raw, 'managerEmail'),
    managerPhone: pick(raw, 'managerPhone'),

    categorySlug: pick(raw, 'categorySlug'),
    coordinatorCount: Number(pick(raw, 'coordinatorCount', 0)),
  };
};

export const normalizeRule = (raw, index = 0) => {
  if (!raw) return null;
  if (typeof raw === 'string') return { ruleId: index, displayOrder: index, ruleText: raw };
  return {
    ruleId: pick(raw, 'ruleId', index),
    displayOrder: Number(pick(raw, 'displayOrder', index)),
    ruleText: pick(raw, 'ruleText', ''),
  };
};

export const normalizeCoordinator = (raw, index = 0) => {
  if (!raw) return null;
  return {
    coordinatorId: pick(raw, 'coordinatorId', index),
    fullName: pick(raw, 'fullName', ''),
    role: pick(raw, 'role'),
    email: pick(raw, 'email'),
    // Privacy gate: phone is dropped unless explicitly enabled.
    phone: FEATURES.SHOW_COORDINATOR_PHONE ? pick(raw, 'phone') : null,
    eventId: Number(pick(raw, 'eventId', 0)),
    eventTitle: pick(raw, 'eventTitle'),
    displayOrder: Number(pick(raw, 'displayOrder', index)),
  };
};

export const normalizeSlot = (raw, index = 0) => {
  if (!raw) return null;
  return {
    slotId: pick(raw, 'slotId', index),
    dayNumber: pick(raw, 'dayNumber'),
    title: pick(raw, 'title'),
    startTime: pick(raw, 'startTime'),
    endTime: pick(raw, 'endTime'),
    venue: pick(raw, 'venue'),
    notes: pick(raw, 'notes'),
  };
};

/** Full detail payload: event + rules + coordinators + slots in one object. */
export const normalizeEventDetail = (raw) => {
  if (!raw) return null;
  const base = normalizeEvent(raw);
  const bySortOrder = (a, b) => a.displayOrder - b.displayOrder;
  return {
    ...base,
    tierDescription: pick(raw, 'tierDescription'),
    venueBuilding: pick(raw, 'venueBuilding'),
    venueMapUrl: pick(raw, 'venueMapUrl'),
    rules: asArray(pick(raw, 'rules')).map(normalizeRule).filter(Boolean).sort(bySortOrder),
    coordinators: asArray(pick(raw, 'coordinators'))
      .map(normalizeCoordinator)
      .filter(Boolean)
      .sort(bySortOrder),
    slots: asArray(pick(raw, 'slots')).map(normalizeSlot).filter(Boolean),
  };
};

/* =========================================================================
 * 7. FORMATTERS — display business rules, defined once
 * ========================================================================= */

/** Placeholder used ONLY when FEATURES.HIDE_EMPTY_FIELDS is turned off. */
export const TBA_LABEL = 'To be announced';

/**
 * The single predicate every component uses to decide whether a content field
 * is worth rendering. Null, undefined and whitespace-only all count as absent.
 */
export const hasValue = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'number') return Number.isFinite(value);
  return String(value).trim().length > 0;
};

/** min=max=1 -> "Individual"; min=max=n -> "Team of n"; else "n–m members". */
export const formatTeamSize = (minTeamSize, maxTeamSize) => {
  const min = Number(minTeamSize) || 1;
  const max = Number(maxTeamSize) || min;
  if (min === 1 && max === 1) return 'Individual';
  if (min === max) return `Team of ${min}`;
  return `${min}–${max} members`;
};

/** null AND 0 both read as "Free". Anything else is PKR. */
export const formatEntryFee = (entryFee) => {
  if (entryFee === null || entryFee === undefined) return 'Free';
  const amount = Number(entryFee);
  if (!Number.isFinite(amount) || amount <= 0) return 'Free';
  return `Rs. ${amount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
};

/**
 * Agreed rule: an unconfirmed field is HIDDEN, not labelled.
 * Returns null when there is nothing to show, so callers can skip the row
 * entirely. Falls back to TBA_LABEL only if HIDE_EMPTY_FIELDS is disabled.
 */
export const formatOrHide = (value) => {
  if (hasValue(value)) return String(value).trim();
  return FEATURES.HIDE_EMPTY_FIELDS ? null : TBA_LABEL;
};

/**
 * Dates are rendered in Asia/Karachi explicitly. The backend stores local PKT
 * event times; we never let the visitor's device timezone shift them.
 */
export const formatDate = (value, options = {}) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: SITE.TIMEZONE,
    ...options,
  }).format(date);
};

/** "1 – 5 November 2026" style range for the hero. */
export const formatDateRange = (startDate, endDate) => {
  if (!startDate) return null;
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;
  if (Number.isNaN(start.getTime())) return null;
  if (!end || Number.isNaN(end.getTime())) return formatDate(startDate);

  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    const dayOnly = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      timeZone: SITE.TIMEZONE,
    }).format(start);
    return `${dayOnly} – ${formatDate(endDate)}`;
  }
  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
};

/** Deterministic monogram used by the gradient fallback when imageUrl is null. */
export const buildMonogram = (title = '') =>
  String(title)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('') || 'NX';

/** Card size per tier: Tier 1 large, Tier 2 medium, Tier 3 compact (§7.4). */
export const TIER_PRESENTATION = {
  1: { variant: 'large', accent: BRAND.COLORS.mint, label: 'Flagship events' },
  2: { variant: 'medium', accent: BRAND.COLORS.cyan, label: 'Mid-level events' },
  3: { variant: 'compact', accent: BRAND.COLORS.lilac, label: 'Quick-fire events' },
};

/**
 * "Tier 1" when the tier is literally named that, "Tier 1 — Flagship" otherwise.
 * Avoids the "Tier 1 — Tier 1" duplication in admin lists and selects.
 */
export const formatTierLabel = (tierLevel, tierName) => {
  const base = `Tier ${tierLevel}`;
  const name = (tierName || '').trim();
  return !name || name.toLowerCase() === base.toLowerCase() ? base : `${base} — ${name}`;
};

export const getTierPresentation = (tierLevel) =>
  TIER_PRESENTATION[Number(tierLevel)] || TIER_PRESENTATION[3];

/* =========================================================================
 * 8. MOCK LAYER — fixture-backed mirror of the real API
 *    Active only while ENV.USE_MOCK_API is true. Same shapes, same latency
 *    behaviour, same 404s, so switching to the live backend changes nothing
 *    above this line.
 * ========================================================================= */

const delay = (ms = ENV.MOCK_LATENCY_MS) =>
  new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));

const matchesSearch = (event, term) => {
  if (!term) return true;
  const needle = String(term).trim().toLowerCase();
  if (!needle) return true;
  return [event.title, event.shortSummary, event.category, event.venue, event.description]
    .filter(Boolean)
    .some((field) => String(field).toLowerCase().includes(needle));
};

const mockApi = {
  getFestInfo: async () => {
    await delay();
    return MOCK_FEST_INFO;
  },

  getTiers: async () => {
    await delay();
    return MOCK_TIERS;
  },

  getCategories: async () => {
    await delay();
    return MOCK_CATEGORIES;
  },

  getFaqs: async () => {
    await delay();
    return MOCK_FAQS;
  },

  getTeam: async () => {
    await delay();
    return MOCK_TEAM;
  },

  submitContactMessage: async () => {
    await delay();
    return { accepted: true, mock: true };
  },

  /** Mirrors the API's server-side filters, including the PagedResult envelope. */
  getEvents: async ({ tier, category, categoryId, search, featured, minFee, maxFee } = {}) => {
    await delay();
    const items = MOCK_EVENTS.filter((event) => {
      if (tier !== undefined && tier !== null && Number(event.tierLevel) !== Number(tier)) {
        return false;
      }
      if (category && event.categorySlug !== category) return false;
      if (categoryId && Number(event.categoryId) !== Number(categoryId)) return false;
      if (featured === true && !event.isFeatured) return false;
      if (minFee !== undefined && minFee !== null && (event.entryFee ?? 0) < Number(minFee)) {
        return false;
      }
      if (maxFee !== undefined && maxFee !== null && (event.entryFee ?? 0) > Number(maxFee)) {
        return false;
      }
      return matchesSearch(event, search);
    });

    return { items, page: 1, pageSize: items.length, totalCount: items.length, totalPages: 1 };
  },

  getEventBySlug: async (slug) => {
    await delay();
    const key = String(slug).toLowerCase();
    // Q10: accept a numeric id as a fallback for mistyped or legacy links.
    const event =
      MOCK_EVENTS.find((candidate) => candidate.slug.toLowerCase() === key) ||
      MOCK_EVENTS.find((candidate) => String(candidate.eventId) === key);

    if (!event) {
      throw new ApiError({
        message: ERROR_MESSAGES.NOT_FOUND,
        status: 404,
        code: 'NOT_FOUND',
      });
    }
    return { ...event, ...(MOCK_EVENT_EXTRAS[event.slug] || { rules: [], coordinators: [], slots: [] }) };
  },
};

/* =========================================================================
 * 9. PUBLIC API SURFACE
 *    ⬇⬇ THIS is the only thing components are allowed to import for data. ⬇⬇
 * ========================================================================= */

export const api = {
  // =====================================================================
  //  AUTH
  // =====================================================================

  /** POST /auth/login — stores the JWT centrally on success. */
  async login({ username, password }) {
    const data = await post(ENDPOINTS.auth.login(), { username, password });
    authStore.setSession({
      token: data.token,
      username: data.username,
      role: data.role,
      expiresAt: data.expiresAt,
    });
    return data;
  },

  logout() {
    authStore.clear();
  },

  isAuthenticated: () => authStore.isAuthenticated(),
  getCurrentUser: () => authStore.getUser(),

  async getMe() {
    return get(ENDPOINTS.auth.me());
  },

  // =====================================================================
  //  CONTENT (public)
  // =====================================================================

  /** GET /fest */
  async getFestInfo() {
    const raw = ENV.USE_MOCK_API ? await mockApi.getFestInfo() : await get(ENDPOINTS.fest.get());
    return normalizeFestInfo(raw);
  },

  /** GET /faqs */
  async getFaqs() {
    const raw = ENV.USE_MOCK_API ? await mockApi.getFaqs() : await get(ENDPOINTS.faqs.list());
    return asArray(raw)
      .map(normalizeFaq)
      .filter(Boolean)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  },

  /** GET /team */
  async getOrganisingTeam() {
    const raw = ENV.USE_MOCK_API ? await mockApi.getTeam() : await get(ENDPOINTS.team.list());
    return asArray(raw)
      .map(normalizeTeamMember)
      .filter(Boolean)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  },

  /** POST /contact — includes the honeypot field the API expects. */
  async submitContactMessage(payload) {
    if (ENV.USE_MOCK_API) return mockApi.submitContactMessage();
    return post(ENDPOINTS.contact.submit(), {
      fullName: payload.fullName,
      email: payload.email,
      subject: payload.subject ?? null,
      message: payload.message,
      website: payload.website ?? '',
    });
  },

  /** GET /health */
  async getHealth() {
    if (ENV.USE_MOCK_API) return { status: 'Healthy', mock: true };
    return get(ENDPOINTS.health.get());
  },

  // =====================================================================
  //  TIERS
  // =====================================================================

  async getTiers() {
    const raw = ENV.USE_MOCK_API ? await mockApi.getTiers() : await get(ENDPOINTS.tiers.list());
    return asArray(raw)
      .map(normalizeTier)
      .filter(Boolean)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  },

  async createTier(payload) {
    return normalizeTier(await post(ENDPOINTS.tiers.create(), payload));
  },

  async updateTier(id, payload) {
    return normalizeTier(await put(ENDPOINTS.tiers.update(id), payload));
  },

  async deleteTier(id) {
    return del(ENDPOINTS.tiers.remove(id));
  },

  // =====================================================================
  //  CATEGORIES
  // =====================================================================

  async getCategories() {
    const raw = ENV.USE_MOCK_API
      ? await mockApi.getCategories()
      : await get(ENDPOINTS.categories.list());
    return asArray(raw)
      .map(normalizeCategory)
      .filter(Boolean)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  },

  async createCategory(payload) {
    return normalizeCategory(await post(ENDPOINTS.categories.create(), payload));
  },

  async updateCategory(id, payload) {
    return normalizeCategory(await put(ENDPOINTS.categories.update(id), payload));
  },

  async deleteCategory(id) {
    return del(ENDPOINTS.categories.remove(id));
  },

  // =====================================================================
  //  EVENTS
  // =====================================================================

  /**
   * GET /events — supports every server-side filter.
   * Returns { items, totalCount, page, pageSize }.
   */
  async getEventsPaged(params = {}) {
    const raw = ENV.USE_MOCK_API
      ? await mockApi.getEvents(params)
      : await get(ENDPOINTS.events.list(params));

    const paged = unwrapPaged(raw);
    return {
      ...paged,
      items: paged.items.map(normalizeEvent).filter(Boolean),
    };
  },

  /** Convenience wrapper returning just the array (used by the public catalog). */
  async getEvents(params = {}) {
    const { items } = await api.getEventsPaged(params);
    return items.sort(
      (a, b) => a.tierLevel - b.tierLevel || Number(b.isFeatured) - Number(a.isFeatured) ||
        a.title.localeCompare(b.title),
    );
  },

  /** GET /events/slug/{slug} — full detail. */
  async getEventBySlug(slug) {
    if (!slug) {
      throw new ApiError({ message: ERROR_MESSAGES.NOT_FOUND, status: 404, code: 'NOT_FOUND' });
    }
    const raw = ENV.USE_MOCK_API
      ? await mockApi.getEventBySlug(slug)
      : await get(ENDPOINTS.events.bySlug(slug));
    return normalizeEventDetail(raw);
  },

  /** GET /events/{id} — full detail by numeric id (admin edit form). */
  async getEventById(id) {
    return normalizeEventDetail(await get(ENDPOINTS.events.byId(id)));
  },

  /** GET /events/stats — admin dashboard aggregates. */
  async getDashboardStats() {
    return get(ENDPOINTS.events.stats());
  },

  async createEvent(payload) {
    return normalizeEventDetail(await post(ENDPOINTS.events.create(), toEventPayload(payload)));
  },

  async updateEvent(id, payload) {
    return normalizeEventDetail(await put(ENDPOINTS.events.update(id), toEventPayload(payload)));
  },

  /** Soft-deletes by default; pass hard=true to permanently remove. */
  async deleteEvent(id, hard = false) {
    return del(ENDPOINTS.events.remove(id, hard));
  },

  // =====================================================================
  //  COORDINATORS
  // =====================================================================

  async getCoordinators(eventId) {
    return asArray(await get(ENDPOINTS.coordinators.list(eventId)))
      .map(normalizeCoordinator)
      .filter(Boolean);
  },

  async createCoordinator(payload) {
    return normalizeCoordinator(await post(ENDPOINTS.coordinators.create(), payload));
  },

  async updateCoordinator(id, payload) {
    return normalizeCoordinator(await put(ENDPOINTS.coordinators.update(id), payload));
  },

  async deleteCoordinator(id) {
    return del(ENDPOINTS.coordinators.remove(id));
  },

  // =====================================================================
  //  DEFERRED SCOPE (flag-gated)
  // =====================================================================

  async getSchedule(day) {
    if (!FEATURES.SCHEDULE_PAGE) return [];
    return asArray(await get(ENDPOINTS.schedule.byDay(day))).map(normalizeSlot).filter(Boolean);
  },

  async getSponsors() {
    if (!FEATURES.SPONSORS_PAGE) return [];
    return asArray(await get(ENDPOINTS.sponsors.list()));
  },

  async getVenues() {
    if (!FEATURES.VENUES_PAGE) return [];
    return asArray(await get(ENDPOINTS.venues.list()));
  },
};

/**
 * Shapes an admin form into the exact EventSaveDto the API expects.
 * Empty strings become null so SQL stores NULL, not ''.
 */
const blankToNull = (value) => {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text.length ? text : null;
};

function toEventPayload(form) {
  return {
    tierId: Number(form.tierId),
    categoryId: form.categoryId ? Number(form.categoryId) : null,
    venueId: form.venueId ? Number(form.venueId) : null,
    title: String(form.title || '').trim(),
    slug: blankToNull(form.slug),
    shortSummary: blankToNull(form.shortSummary),
    description: blankToNull(form.description),
    imageUrl: blankToNull(form.imageUrl),
    durationText: blankToNull(form.durationText),
    minTeamSize: Number(form.minTeamSize) || 1,
    maxTeamSize: Number(form.maxTeamSize) || 1,
    prizeInfo: blankToNull(form.prizeInfo),
    entryFee:
      form.entryFee === '' || form.entryFee === null || form.entryFee === undefined
        ? null
        : Number(form.entryFee),
    isFeatured: Boolean(form.isFeatured),
    isActive: form.isActive === undefined ? true : Boolean(form.isActive),
    managerName: blankToNull(form.managerName),
    managerEmail: blankToNull(form.managerEmail),
    managerPhone: blankToNull(form.managerPhone),
    winnerPrize: blankToNull(form.winnerPrize),
    runnerUpPrize: blankToNull(form.runnerUpPrize),
    prizePool: blankToNull(form.prizePool),
    rules: Array.isArray(form.rules)
      ? form.rules
          .filter((r) => blankToNull(r.ruleText))
          .map((r, i) => ({ ruleText: String(r.ruleText).trim(), displayOrder: i + 1 }))
      : undefined,
  };
}

/* =========================================================================
 * 10. QUERY KEYS + CACHE POLICY
 *     Centralised so cache invalidation is governed in one place too.
 * ========================================================================= */

export const QUERY_KEYS = {
  fest: () => ['fest'],
  tiers: () => ['tiers'],
  categories: () => ['categories'],
  faqs: () => ['faqs'],
  team: () => ['team'],
  events: (params = {}) => ['events', params],
  eventsPaged: (params = {}) => ['events-paged', params],
  eventDetail: (slug) => ['event', slug],
  eventById: (id) => ['event-id', id],
  coordinators: (eventId) => ['coordinators', eventId ?? 'all'],
  stats: () => ['admin-stats'],
};

/** Content changes rarely; mirrors the backend's 5–10 min IMemoryCache. */
export const QUERY_DEFAULTS = {
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  refetchOnWindowFocus: false,
  retry: (failureCount, error) => {
    if (error instanceof ApiError && (error.isNotFound || error.code === 'CLIENT')) return false;
    return failureCount < 2;
  },
};

export default {
  ENV,
  FEATURES,
  BRAND,
  SITE,
  ROUTES,
  NAV_LINKS,
  ENDPOINTS,
  authStore,
  httpClient,
  api,
  QUERY_KEYS,
  QUERY_DEFAULTS,
};
