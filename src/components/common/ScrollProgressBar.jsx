import { useScrollProgress } from '../../hooks/useScrollProgress.js';

/** Thin brand-gradient reading-progress bar pinned under the navbar. */
export default function ScrollProgressBar() {
  const { progress } = useScrollProgress();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent">
      <div
        className="h-full origin-left bg-gradient-to-r from-nexus-blue via-nexus-cyan to-nexus-mint transition-[width] duration-150"
        style={{ width: `${progress * 100}%` }}
        aria-hidden="true"
      />
    </div>
  );
}
