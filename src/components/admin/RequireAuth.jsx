import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { api, ROUTES } from '../../config.js';

/**
 * Route guard. Auth state is read through config.js only.
 * Note this is a UX gate, not a security boundary — the API enforces
 * [Authorize] on every write regardless of what the browser believes.
 */
export default function RequireAuth() {
  const location = useLocation();

  if (!api.isAuthenticated()) {
    return <Navigate to={ROUTES.ADMIN_LOGIN} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
