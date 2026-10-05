import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets scroll AND moves keyboard focus to the main landmark on every route
 * change, so screen-reader users are not stranded at the bottom of the old page.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    const main = document.getElementById('main-content');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
    }
  }, [pathname]);

  return null;
}
