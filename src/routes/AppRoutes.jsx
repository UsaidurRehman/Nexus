import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from '../components/layout/Layout.jsx';
import RequireAuth from '../components/admin/RequireAuth.jsx';
import { FEATURES, ROUTES } from '../config.js';

// Routes are code-split so the first paint only ships the Home bundle.
const Home = lazy(() => import('../pages/Home.jsx'));
const Events = lazy(() => import('../pages/Events.jsx'));
const EventDetail = lazy(() => import('../pages/EventDetail.jsx'));
const NotFound = lazy(() => import('../pages/NotFound.jsx'));
const Faqs = lazy(() => import('../pages/Faqs.jsx'));
const Team = lazy(() => import('../pages/Team.jsx'));
const Contact = lazy(() => import('../pages/Contact.jsx'));

// The whole admin section is a separate chunk — public visitors never download it.
const AdminLogin = lazy(() => import('../pages/admin/AdminLogin.jsx'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard.jsx'));
const AdminEvents = lazy(() => import('../pages/admin/AdminEvents.jsx'));
const AdminEventForm = lazy(() => import('../pages/admin/AdminEventForm.jsx'));
const AdminCoordinators = lazy(() => import('../pages/admin/AdminCoordinators.jsx'));
const AdminTaxonomy = lazy(() => import('../pages/admin/AdminTaxonomy.jsx'));

function RouteFallback() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center" role="status" aria-label="Loading">
      <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-nexus-mint" />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* ---------------- Public ---------------- */}
        <Route element={<Layout />}>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.EVENTS} element={<Events />} />
          <Route path={ROUTES.EVENT_DETAIL()} element={<EventDetail />} />
          {FEATURES.FAQS_PAGE ? <Route path={ROUTES.FAQS} element={<Faqs />} /> : null}
          {FEATURES.TEAM_PAGE ? <Route path={ROUTES.TEAM} element={<Team />} /> : null}
          {FEATURES.CONTACT_FORM ? <Route path={ROUTES.CONTACT} element={<Contact />} /> : null}
        </Route>

        {/* ---------------- Admin ----------------
            Rendered outside <Layout> so the console gets its own chrome. */}
        {FEATURES.ADMIN_PANEL ? (
          <>
            <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />
            <Route element={<RequireAuth />}>
              <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
              <Route path={ROUTES.ADMIN_EVENTS} element={<AdminEvents />} />
              <Route path={ROUTES.ADMIN_EVENT_NEW} element={<AdminEventForm />} />
              <Route path={ROUTES.ADMIN_EVENT_EDIT()} element={<AdminEventForm />} />
              <Route path={ROUTES.ADMIN_COORDINATORS} element={<AdminCoordinators />} />
              <Route path={ROUTES.ADMIN_TAXONOMY} element={<AdminTaxonomy />} />
            </Route>
          </>
        ) : null}

        {/* ---------------- Fallback ---------------- */}
        <Route element={<Layout />}>
          <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
