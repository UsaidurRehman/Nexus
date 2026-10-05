import { useState } from 'react';
import Seo from '../components/common/Seo.jsx';
import AsyncBoundary from '../components/common/AsyncBoundary.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { useFaqs } from '../hooks/useFestData.js';
import { BOOKLET, FEATURES, ROUTES } from '../config.js';

function FaqItem({ faq, isOpen, onToggle }) {
  const panelId = `faq-panel-${faq.faqId}`;
  const buttonId = `faq-button-${faq.faqId}`;

  return (
    <div className="nx-surface overflow-hidden">
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-start justify-between gap-5 px-5 py-5 text-left transition-colors hover:bg-white/[0.03] sm:px-6"
        >
          <span className="font-display text-base leading-snug text-white sm:text-lg">
            {faq.question}
          </span>
          <span
            className={`mt-0.5 shrink-0 text-nexus-mint transition-transform duration-300 ${
              isOpen ? 'rotate-45' : ''
            }`}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path strokeLinecap="round" d="M12 5v14M5 12h14" />
            </svg>
          </span>
        </button>
      </h3>

      {/* Grid-rows trick animates height without measuring the content. */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid transition-all duration-300 ease-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm leading-relaxed text-slate-300 sm:px-6">{faq.answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function Faqs() {
  const faqsQuery = useFaqs();
  const [openId, setOpenId] = useState(null);
  const faqs = faqsQuery.data || [];

  return (
    <>
      <Seo
        title="FAQs"
        description="Answers to the most common questions about BIIT Nexus 2026 — registration, discounts, campus ambassador codes and venue access."
        path={ROUTES.FAQS}
      />

      <section className="relative overflow-hidden border-b border-white/8 pb-14 pt-32 sm:pt-36">
        <div className="nx-glow absolute inset-0 opacity-80" aria-hidden="true" />
        <div className="nx-grid-bg absolute inset-0 opacity-25" aria-hidden="true" />
        <div className="nx-container relative">
          <span className="nx-chip">Help</span>
          <h1 className="mt-5 font-display text-[clamp(2.6rem,7vw,4.75rem)] leading-[0.92] tracking-tightest">
            <span className="nx-gradient-text">FAQs</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Everything participants ask most often. If your question is not here, the organising
            team is one message away.
          </p>
        </div>
      </section>

      <div className="nx-container py-16 sm:py-20">
        <AsyncBoundary
          isLoading={faqsQuery.isLoading}
          isError={faqsQuery.isError}
          error={faqsQuery.error}
          onRetry={faqsQuery.refetch}
        >
          {faqs.length === 0 ? (
            <EmptyState
              title="No questions published yet"
              message="The organising team is still preparing this section. Check back shortly."
            />
          ) : (
            <div className="mx-auto grid max-w-3xl gap-3">
              {faqs.map((faq) => (
                <FaqItem
                  key={faq.faqId}
                  faq={faq}
                  isOpen={openId === faq.faqId}
                  onToggle={() => setOpenId((current) => (current === faq.faqId ? null : faq.faqId))}
                />
              ))}
            </div>
          )}
        </AsyncBoundary>

        {FEATURES.BOOKLET_LINK ? (
          <div className="mx-auto mt-10 max-w-3xl text-center">
            <p className="text-sm text-slate-400">
              Looking for the complete rules and schedule?
            </p>
            <a
              href={BOOKLET.URL}
              target="_blank"
              rel="noopener noreferrer"
              className="nx-btn nx-btn-primary mt-4"
            >
              Open the {BOOKLET.LABEL}
            </a>
          </div>
        ) : null}
      </div>
    </>
  );
}
