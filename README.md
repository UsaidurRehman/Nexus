# Nexus Tech Fest 2026 — Web Portal (Frontend)

Public, read-only informational portal for **NEXUS**, the seven-day technology festival of
**BIIT, Rawalpindi**. Starts **16 November 2026**.

Built with **React 18 + Vite + Tailwind CSS + React Router + TanStack Query + Axios**.

---

## ⚠️ The one architectural rule

> **`src/config.js` is the only file in this codebase allowed to know about the backend.**

Every API endpoint, base URL, header, interceptor, timeout, error shape, response
normalizer and integration function lives there. **No component, page or hook imports
axios, calls `fetch()`, or hardcodes a URL.** They import the `api.*` helpers.

Swapping, versioning or re-pointing the backend is therefore always a **single-file change**.

Verify the contract at any time:

```bash
grep -rn "axios\|fetch(" src --include=*.jsx --include=*.js | grep -v "src/config.js"
# must return nothing (ignoring React Query's .refetch())
```

### What's inside `config.js`

| Section | Responsibility |
|---|---|
| `ENV` | Base URL, timeouts, mock switch, asset base, deploy base path |
| `FEATURES` | Feature flags — Phase 1 on, deferred scope off |
| `BRAND` / `SITE` | Palette, logo paths, SEO defaults, timezone |
| `ROUTES` / `NAV_LINKS` | Canonical route table; nav auto-filtered by flags |
| `ENDPOINTS` | **Every API path, as a function.** Single source of truth |
| `httpClient` | One axios instance + request/response interceptors |
| `ApiError` | Normalized error class; maps `ProblemDetails` → friendly copy |
| `normalize*` | Backend payload → stable UI model (absorbs casing/envelope drift) |
| `format*` | Display business rules (team size, fee, TBA, PKT dates) |
| `mockApi` | Fixture-backed mirror of the API for offline development |
| `api.*` | **The public surface. This is what hooks call.** |
| `QUERY_KEYS` / `QUERY_DEFAULTS` | Cache keys and policy |

---

## Quick start

```bash
npm install
cp .env.example .env
npm run dev          # http://localhost:5173
```

The app ships in **mock mode** — it runs with **no backend at all**.

| Script | Does |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve the production build locally |

---

## Connecting the real ASP.NET Core API

When the backend is ready, edit **`.env` only**:

```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=https://api.nexus.biit.edu.pk
```

That is the entire integration step. No component changes.

### Endpoints consumed (Phase 1)

| Method | Route | `config.js` function |
|---|---|---|
| GET | `/api/v1/fest` | `api.getFestInfo()` |
| GET | `/api/v1/tiers` | `api.getTiers()` |
| GET | `/api/v1/events?tier=&search=&featured=` | `api.getEvents(params)` |
| GET | `/api/v1/events/{slug}` | `api.getEventBySlug(slug)` |
| GET | `/api/v1/health` | `api.getHealth()` |

Deferred endpoints (schedule, sponsors, FAQs, venues, team, contact) are **already declared**
in `ENDPOINTS` and have `api.*` functions gated behind `FEATURES` — enabling them later
requires no new plumbing.

### Contract tolerance (deliberate)

The frontend was written before the API existed, so it is defensive by design:

- **Envelope** — accepts a bare payload *or* `{ success, data, message }`.
- **Casing** — `pick()` reads `eventId` and `EventId` interchangeably. .NET's default
  camelCase serializer and a PascalCase one both work.
- **Errors** — any axios failure becomes one `ApiError` with `status`, `code`, `detail`
  and `isNotFound`. `ProblemDetails` is parsed when present.
- **Nulls** — every optional field has a defined display fallback.

If the real contract differs, fix it in `normalizers` — one place, not twenty components.

---

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `https://localhost:7001` | API root |
| `VITE_USE_MOCK_API` | `true` | Offline fixture mode |
| `VITE_MOCK_LATENCY_MS` | `450` | Simulated latency so loading states are visible |
| `VITE_ASSET_BASE_URL` | *(API base)* | Prefix for relative image paths from the DB |
| `VITE_API_TIMEOUT_MS` | `15000` | Request timeout |
| `VITE_PUBLIC_BASE` | `/` | Set to `/nexus/` for subfolder deploys |
| `VITE_SITE_URL` | — | Canonical origin for absolute OG/SEO URLs |

---

## Scope — Phase 1 (strict)

**Live:** Home · Events (grouped by tier) · Event Detail · 404

| Decision | Value |
|---|---|
| Scope | Strict Phase 1 only |
| Backend | Not live → mock layer |
| Registration | **No CTA** (`FEATURES.REGISTRATION_CTA = false`) |
| Stack | Plain JavaScript (JSX) + Tailwind |

Deferred pages (About, Schedule, Venues, Sponsors, Team, FAQs, Announcements, Contact)
are **off** via `FEATURES`. Each becomes available by flipping one boolean and adding a
route — the API functions, endpoints and nav wiring already exist.

---

## Display rules (implemented in `config.js`, applied app-wide)

| Case | Renders as |
|---|---|
| `imageUrl` is null | Tier-coloured gradient with the event's monogram |
| Missing venue / duration / prize | **Hidden entirely** — the row/chip is not rendered |
| `minTeamSize === maxTeamSize === 1` | `Individual` |
| `min === max === n` | `Team of n` |
| Otherwise | `n–m members` |
| `entryFee` null **or** 0 | `Free` |
| `entryFee` > 0 | `Rs. 1,500` (PKR, `en-PK` grouping) |
| `isActive === false` | Filtered out before reaching the UI |
| Tier with zero events | Section hidden entirely |
| Coordinator phone | Hidden — gated by `FEATURES.SHOW_COORDINATOR_PHONE` |

Unconfirmed content is **omitted, never labelled**. One predicate, `hasValue()`, and one
formatter, `formatOrHide()`, govern this app-wide — `formatOrHide()` returns `null` so the
caller skips the element. To switch back to a `"To be announced"` placeholder instead, set
`FEATURES.HIDE_EMPTY_FIELDS = false` in `config.js`; nothing else changes.

**Timezone:** all dates render explicitly in `Asia/Karachi` via `Intl.DateTimeFormat`.
The visitor's device timezone can never shift a fest time.

---

## Project structure

```
nexus-web/
├── public/brand/            nexus-logo.png · nexus-hero.jpg · favicon.png
├── src/
│   ├── config.js            ★ THE CENTRALIZED CONFIG — read this first
│   ├── mocks/fixtures.js    Offline placeholder content (delete once API is live)
│   ├── components/
│   │   ├── layout/          Navbar · Footer · Layout · Hero
│   │   ├── common/          AsyncBoundary · ErrorState · EmptyState · Skeletons
│   │   │                    Seo · Countdown · RevealOnScroll · ScrollToTop
│   │   │                    ScrollProgressBar · SectionTitle · AppErrorBoundary
│   │   └── events/          EventCard · EventGrid · TierSection · EventSearch
│   │                        TierJumpLinks
│   ├── pages/               Home · Events · EventDetail · NotFound
│   ├── hooks/               useFestData · useCountdown · useScrollProgress
│   ├── routes/AppRoutes.jsx Lazy-loaded route table
│   └── styles/index.css     Tailwind layers + brand component classes
└── .env.example
```

---

## Design notes

**Branding** — the palette is sampled from the official **Canva design system**: the BIIT
wordmark asset supplies the primary blue `#0531D8`, and the rendered NEXUS '26 banner
supplies the navy → cyan → mint range. The faint grid behind each section echoes the
Rawalpindi map texture used in the banner artwork.

| Token | Hex | Role |
|---|---|---|
| `ink` | `#01061F` | Page background |
| `abyss` | `#020A3D` | Raised background |
| `navy` | `#020B83` | Deep brand navy |
| `blue` | `#0531D8` | **BIIT official blue — primary** |
| `cyan` | `#12A4D9` | Tier 2 accent |
| `mint` | `#7DFBA4` | **Accent** — CTAs, Tier 1, focus rings |
| `lilac` | `#B4BFFD` | Tier 3 accent, secondary text |

Defined once in `BRAND.COLORS` (`config.js`) and mirrored in `tailwind.config.js`.
Rebranding touches those two files only.

**Hero** — the supplied banner is a full-bleed background layer that always covers the
viewport (never letterboxes or distorts). On scroll it drifts upward and fades at ~40% of
page speed. `background-attachment: fixed` is deliberately avoided (broken on iOS Safari);
a GPU-composited `transform` is used instead, and it is disabled under
`prefers-reduced-motion`.

**Logo** — top-left in the header, always routes to `/`. Also present on the 404 page as a
route home.

**Events page** — one `GET /events` request fetches the whole list; tiers are grouped and
search is filtered **client-side**, so typing is instant and switching tiers costs no
network. Tier 1 renders as large cards, Tier 2 medium, Tier 3 compact.

**Accessibility** — skip-link, focus moved to `<main>` on every route change, visible
`:focus-visible` rings, `aria-live` search results, labelled landmarks, full
`prefers-reduced-motion` support.

**Performance** — routes are code-split (`React.lazy`); Home ships ~104 kB gzipped total.
Images lazy-load with `decoding="async"`; the hero uses `fetchpriority="high"`.

**Security** — event descriptions are confirmed plain text and are rendered as React text
nodes split on blank lines. `dangerouslySetInnerHTML` is **not used anywhere**, so there is
no injection surface. If the content team ever needs rich text, add DOMPurify at the
normalizer in `config.js`.

---

## Deployment

```bash
npm run build     # → dist/
```

Serve `dist/` as static files.

**SPA rewrite is required** — all routes must fall back to `index.html`, or
`/events/some-slug` will 404 on refresh.

<details>
<summary>IIS — <code>web.config</code> in <code>dist/</code></summary>

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="SPA" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/api/" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```
</details>

**Subfolder deploy** (e.g. `https://biit.edu.pk/nexus/`): set `VITE_PUBLIC_BASE=/nexus/`.
Vite's `base` and the router `basename` both read it automatically.

**CORS:** the API must allow the portal's origin. Alternatively set
`VITE_API_BASE_URL=/api` and reverse-proxy — same-origin, no CORS at all.

---

## Backend recommendations (approved, for the .NET/SQL team)

These were agreed during discovery and are **not yet in the design document's schema**:

| # | Change | Why |
|---|---|---|
| R10 | `Events.DisplayOrder INT NOT NULL DEFAULT 0` | Manual ordering within a tier. **The frontend already sorts by it.** |
| R11 | `EventRules.DisplayOrder` | Rule order is semantic. **Frontend already sorts by it.** |
| R12 | `CHECK (FestInfoId = 1)` on `FestInfo` | Enforce the single-row assumption |
| R13 | **Timezone** — use `DATETIMEOFFSET` for `ScheduleSlots`/`FestInfo`, or document "all times PKT" | Audit columns use `SYSUTCDATETIME()` but event times are local PKT. Mixing them silently breaks countdowns. The frontend already pins rendering to `Asia/Karachi`. |
| R15 | Indexes on `Events(TierId, IsActive)`, `EventCoordinators(EventId)`, `EventRules(EventId)` | List and detail query performance |
| R16 | `Sponsors.Tier` → lookup table or `CHECK` | Free text will drift ("Gold" vs "gold") |
| R17 | ETag / `Last-Modified` on GETs | Near-free client caching for a read-only site |
| R18 | `GET /api/v1/health` | Uptime monitoring across the 7 event days. **Already wired as `api.getHealth()`.** |
| R9 | `Events.RegistrationUrl` + `RegistrationDeadline` | Deferred by decision D3, but cheap to add before content freeze |

Also agreed operationally: a named owner for SSMS content edits during the fest, and a
nightly DB backup.

---

## Before launch

- [ ] Replace `src/mocks/fixtures.js` content with the real event line-up, or point at the live API
- [ ] Set `VITE_USE_MOCK_API=false` and the production `VITE_API_BASE_URL`
- [ ] Set `VITE_SITE_URL` so WhatsApp/LinkedIn share cards resolve
- [ ] Confirm fest dates, venue and contact details in `FestInfo`
- [ ] Add real event images (or keep the gradient monogram fallback — it is intentional, not a placeholder bug)
- [ ] Configure the SPA rewrite rule on the host
- [ ] Lock CORS to the portal origin
- [ ] Test on a real mid-range Android phone over campus Wi-Fi
- [ ] Smoke-test every event slug after the content freeze
