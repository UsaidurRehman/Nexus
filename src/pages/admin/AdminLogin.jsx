import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Seo from '../../components/common/Seo.jsx';
import { Banner, Field, Spinner, TextInput } from '../../components/admin/FormControls.jsx';
import { useLogin } from '../../hooks/useFestData.js';
import { api, BRAND, ROUTES } from '../../config.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const [form, setForm] = useState({ username: '', password: '' });

  // Already signed in? Skip the form.
  if (api.isAuthenticated()) {
    return <Navigate to={location.state?.from || ROUTES.ADMIN_DASHBOARD} replace />;
  }

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    login.mutate(form, {
      onSuccess: () => navigate(location.state?.from || ROUTES.ADMIN_DASHBOARD, { replace: true }),
    });
  };

  return (
    <div className="nx-grid-bg grid min-h-screen place-items-center bg-nexus-ink px-5 py-12 text-white">
      <Seo title="Admin sign in" noIndex />

      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-nexus-blue text-2xl font-black shadow-xl shadow-nexus-blue/30">
            N
          </span>
          <h1 className="mt-5 text-2xl font-black tracking-tight">{BRAND.FULL_NAME}</h1>
          <p className="mt-1 text-sm text-white/50">Event management console</p>
        </div>

        <form onSubmit={handleSubmit} className="nx-surface grid gap-4 p-6">
          {login.isError ? <Banner tone="error">{login.error?.message}</Banner> : null}

          <Field label="Username" required>
            <TextInput
              name="username"
              autoComplete="username"
              autoFocus
              required
              value={form.username}
              onChange={update('username')}
              placeholder="admin"
            />
          </Field>

          <Field label="Password" required>
            <TextInput
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={update('password')}
              placeholder="••••••••"
            />
          </Field>

          <button
            type="submit"
            disabled={login.isPending}
            className="nx-btn nx-btn-primary mt-1 inline-flex w-full items-center justify-center gap-2"
          >
            {login.isPending ? <Spinner className="h-4 w-4" /> : null}
            {login.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/35">
          Protected area. All write operations are authorised server-side.
        </p>
      </div>
    </div>
  );
}
