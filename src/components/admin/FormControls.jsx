/**
 * Small, dependency-free form primitives shared by every admin form.
 * Styling only — no data access lives here.
 */

const BASE_INPUT =
  'w-full rounded-xl border border-white/12 bg-nexus-abyss/70 px-3.5 py-2.5 text-sm text-white ' +
  'placeholder:text-white/30 outline-none transition focus:border-nexus-blue focus:ring-2 focus:ring-nexus-blue/30 ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

export function Field({ label, hint, error, required, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-white/55">
        {label}
        {required ? <span className="ml-1 text-nexus-mint">*</span> : null}
      </span>
      {children}
      {hint && !error ? <span className="mt-1 block text-xs text-white/40">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs text-rose-300">{error}</span> : null}
    </label>
  );
}

export function TextInput({ error, ...props }) {
  return <input {...props} className={`${BASE_INPUT} ${error ? 'border-rose-400/60' : ''}`} />;
}

export function TextArea({ rows = 4, error, ...props }) {
  return (
    <textarea
      rows={rows}
      {...props}
      className={`${BASE_INPUT} resize-y leading-relaxed ${error ? 'border-rose-400/60' : ''}`}
    />
  );
}

export function Select({ children, error, ...props }) {
  return (
    <select {...props} className={`${BASE_INPUT} ${error ? 'border-rose-400/60' : ''}`}>
      {children}
    </select>
  );
}

export function Checkbox({ label, description, ...props }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-nexus-abyss/40 p-3.5 transition hover:border-white/20">
      <input
        type="checkbox"
        {...props}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-nexus-blue"
      />
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {description ? <span className="block text-xs text-white/45">{description}</span> : null}
      </span>
    </label>
  );
}

export function FormSection({ title, description, children }) {
  return (
    <section className="nx-surface p-5 sm:p-6">
      <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-nexus-mint">{title}</h2>
      {description ? <p className="mt-1 text-xs text-white/45">{description}</p> : null}
      <div className="mt-5 grid gap-4">{children}</div>
    </section>
  );
}

export function Banner({ tone = 'info', children }) {
  const tones = {
    info: 'border-nexus-cyan/30 bg-nexus-cyan/10 text-nexus-cyan',
    error: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
    success: 'border-nexus-mint/30 bg-nexus-mint/10 text-nexus-mint',
  };
  return (
    <div role="status" className={`rounded-xl border px-4 py-3 text-sm ${tones[tone] || tones.info}`}>
      {children}
    </div>
  );
}

export function Spinner({ className = 'h-5 w-5' }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-2 border-white/20 border-t-nexus-mint ${className}`}
    />
  );
}
