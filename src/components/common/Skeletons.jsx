export function SkeletonLine({ className = '' }) {
  return <div className={`nx-skeleton h-4 ${className}`} />;
}

export function EventCardSkeleton({ variant = 'medium' }) {
  const mediaHeight =
    variant === 'large' ? 'h-56 sm:h-72' : variant === 'compact' ? 'h-28' : 'h-40';
  return (
    <div className="nx-surface overflow-hidden p-0" aria-hidden="true">
      <div className={`nx-skeleton rounded-none ${mediaHeight}`} />
      <div className="space-y-3 p-5">
        <SkeletonLine className="w-3/4" />
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-5/6" />
        <div className="flex gap-2 pt-2">
          <SkeletonLine className="h-6 w-24 rounded-full" />
          <SkeletonLine className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function EventGridSkeleton({ count = 3, variant = 'medium' }) {
  const cols =
    variant === 'large'
      ? 'grid-cols-1 lg:grid-cols-3'
      : variant === 'compact'
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  return (
    <div className={`grid gap-6 ${cols}`}>
      {Array.from({ length: count }).map((_, index) => (
        <EventCardSkeleton key={index} variant={variant} />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="nx-skeleton h-64 w-full sm:h-80" />
      <SkeletonLine className="h-9 w-2/3" />
      <SkeletonLine className="w-full" />
      <SkeletonLine className="w-11/12" />
      <SkeletonLine className="w-4/5" />
    </div>
  );
}
