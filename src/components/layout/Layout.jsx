import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import ScrollToTop from '../common/ScrollToTop.jsx';
import ScrollProgressBar from '../common/ScrollProgressBar.jsx';
import { useFestInfo } from '../../hooks/useFestData.js';

export default function Layout() {
  // Fest info is fetched once here and shared via the query cache.
  const { data: fest } = useFestInfo();

  return (
    <div className="flex min-h-screen flex-col bg-nexus-ink">
      <ScrollToTop />
      <ScrollProgressBar />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-nexus-mint focus:px-5 focus:py-3 focus:font-bold focus:text-nexus-ink"
      >
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content" className="flex-1 focus:outline-none">
        <Outlet context={{ fest }} />
      </main>

      <Footer fest={fest} />
    </div>
  );
}
