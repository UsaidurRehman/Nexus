export default function SectionTitle({ eyebrow, title, description, id, align = 'left' }) {
  const alignment = align === 'center' ? 'text-center mx-auto items-center' : 'text-left';
  return (
    <header className={`flex max-w-3xl flex-col gap-3 ${alignment}`}>
      {eyebrow ? (
        <span className="nx-eyebrow">
          <span className="h-px w-8 bg-nexus-mint/70" aria-hidden="true" />
          {eyebrow}
        </span>
      ) : null}
      <h2 id={id} className="font-display text-3xl leading-[1.05] text-white sm:text-[40px]">
        {title}
      </h2>
      {description ? <p className="text-base leading-relaxed text-slate-400">{description}</p> : null}
    </header>
  );
}
