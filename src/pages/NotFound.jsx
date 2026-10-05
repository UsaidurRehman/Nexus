import { Link } from 'react-router-dom';
import Seo from '../components/common/Seo.jsx';
import { BRAND, ROUTES } from '../config.js';

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" description="This page does not exist." path="/404" />
      <section className="nx-container flex min-h-[80vh] flex-col items-center justify-center py-28 text-center">
        <div className="nx-grid-bg pointer-events-none absolute inset-0 -z-10 opacity-25" aria-hidden="true" />

        {/* Logo also returns home from here */}
        <Link to={ROUTES.HOME} aria-label="Go to home page">
          <img src={BRAND.LOGO} alt="" width="80" height="80" className="h-20 w-20 animate-float" />
        </Link>

        <p className="mt-8 font-display text-[clamp(4rem,16vw,9rem)] leading-none">
          <span className="nx-gradient-text">404</span>
        </p>
        <h1 className="mt-2 font-display text-2xl text-white sm:text-3xl">
          This page is not on the map
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-slate-400">
          The page you are looking for does not exist, or the event may have been moved or retired.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link to={ROUTES.HOME} className="nx-btn-primary">
            Back to home
          </Link>
          <Link to={ROUTES.EVENTS} className="nx-btn-ghost">
            Browse events
          </Link>
        </div>
      </section>
    </>
  );
}
