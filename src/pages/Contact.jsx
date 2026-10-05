import { useState } from 'react';
import Seo from '../components/common/Seo.jsx';
import { useFestInfo, useSubmitContact } from '../hooks/useFestData.js';
import { BOOKLET, FEATURES, ROUTES, formatOrHide } from '../config.js';

const EMPTY = { fullName: '', email: '', subject: '', message: '', website: '' };

const INPUT =
  'w-full rounded-xl border border-white/12 bg-nexus-abyss/60 px-4 py-3 text-sm text-white ' +
  'placeholder:text-slate-600 outline-none transition focus:border-nexus-blue focus:ring-2 focus:ring-nexus-blue/25';

function Field({ label, required, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
        {required ? <span className="ml-1 text-nexus-mint">*</span> : null}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs text-rose-300">{error}</span> : null}
    </label>
  );
}

export default function Contact() {
  const { data: festInfo } = useFestInfo();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const submit = useSubmitContact();

  const update = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Please tell us your name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (form.message.trim().length < 10) next.message = 'Please write at least 10 characters.';
    setErrors(next);
    if (Object.keys(next).length) return;
    submit.mutate(form, { onSuccess: () => setForm(EMPTY) });
  };

  const email = formatOrHide(festInfo?.contactEmail);
  const phone = formatOrHide(festInfo?.contactPhone);
  const venue = formatOrHide(festInfo?.venueSummary);

  return (
    <>
      <Seo
        title="Contact"
        description="Get in touch with the BIIT Nexus 2026 organising team."
        path={ROUTES.CONTACT}
      />

      <section className="relative overflow-hidden border-b border-white/8 pb-14 pt-32 sm:pt-36">
        <div className="nx-glow absolute inset-0 opacity-80" aria-hidden="true" />
        <div className="nx-grid-bg absolute inset-0 opacity-25" aria-hidden="true" />
        <div className="nx-container relative">
          <span className="nx-chip">Get in touch</span>
          <h1 className="mt-5 font-display text-[clamp(2.6rem,7vw,4.75rem)] leading-[0.92] tracking-tightest">
            <span className="nx-gradient-text">Contact</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Questions about an event, sponsorship or participation? Send us a message and the
            organising team will get back to you.
          </p>
        </div>
      </section>

      <div className="nx-container grid gap-10 py-16 lg:grid-cols-[1.4fr_1fr] lg:gap-14 sm:py-20">
        {/* ---------------- Form ---------------- */}
        <div>
          {submit.isSuccess ? (
            <div
              role="status"
              className="rounded-2xl border border-nexus-mint/30 bg-nexus-mint/10 p-6"
            >
              <h2 className="font-display text-xl text-nexus-mint">Message sent</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Thank you for reaching out. The organising team will reply to you by email.
              </p>
              <button
                type="button"
                onClick={() => submit.reset()}
                className="nx-btn nx-btn-ghost mt-5 text-sm"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="nx-surface grid gap-5 p-6 sm:p-8" noValidate>
              {submit.isError ? (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200"
                >
                  {submit.error?.message}
                </div>
              ) : null}

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Your name" required error={errors.fullName}>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={update('fullName')}
                    maxLength={120}
                    autoComplete="name"
                    placeholder="Abdullah Khan"
                    className={INPUT}
                  />
                </Field>

                <Field label="Email" required error={errors.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    maxLength={150}
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={INPUT}
                  />
                </Field>
              </div>

              <Field label="Subject">
                <input
                  type="text"
                  value={form.subject}
                  onChange={update('subject')}
                  maxLength={150}
                  placeholder="Question about Code Relay"
                  className={INPUT}
                />
              </Field>

              <Field label="Message" required error={errors.message}>
                <textarea
                  rows={6}
                  value={form.message}
                  onChange={update('message')}
                  maxLength={2000}
                  placeholder="How can we help?"
                  className={`${INPUT} resize-y leading-relaxed`}
                />
              </Field>

              {/* Honeypot: invisible to humans, irresistible to bots. The API
                  silently discards any submission where this is filled in. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={form.website}
                onChange={update('website')}
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />

              <button
                type="submit"
                disabled={submit.isPending}
                className="nx-btn nx-btn-primary justify-self-start disabled:opacity-60"
              >
                {submit.isPending ? 'Sending…' : 'Send message'}
              </button>
            </form>
          )}
        </div>

        {/* ---------------- Details ---------------- */}
        <aside className="space-y-5">
          <div className="nx-surface p-6">
            <h2 className="font-display text-lg text-white">Reach us directly</h2>
            <dl className="mt-4 space-y-4 text-sm">
              {email ? (
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">Email</dt>
                  <dd className="mt-1">
                    <a
                      href={`mailto:${email}`}
                      className="break-all font-semibold text-nexus-mint hover:underline"
                    >
                      {email}
                    </a>
                  </dd>
                </div>
              ) : null}

              {phone ? (
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">Phone</dt>
                  <dd className="mt-1">
                    <a href={`tel:${phone}`} className="font-semibold text-nexus-mint hover:underline">
                      {phone}
                    </a>
                  </dd>
                </div>
              ) : null}

              {venue ? (
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">Venue</dt>
                  <dd className="mt-1 font-semibold text-slate-200">{venue}</dd>
                </div>
              ) : null}

              {festInfo?.executiveHead ? (
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    Executive Head
                  </dt>
                  <dd className="mt-1 font-semibold text-slate-200">{festInfo.executiveHead}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          {FEATURES.BOOKLET_LINK ? (
            <div className="nx-surface p-6">
              <h2 className="font-display text-lg text-white">{BOOKLET.LABEL}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{BOOKLET.DESCRIPTION}</p>
              <a
                href={BOOKLET.URL}
                target="_blank"
                rel="noopener noreferrer"
                className="nx-btn nx-btn-primary mt-4 w-full justify-center text-sm"
              >
                Open booklet
              </a>
            </div>
          ) : null}
        </aside>
      </div>
    </>
  );
}
