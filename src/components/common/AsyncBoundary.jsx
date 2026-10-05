import EmptyState from './EmptyState.jsx';
import ErrorState from './ErrorState.jsx';

/**
 * One uniform contract for every data surface in the app:
 * loading -> skeleton, error -> ErrorState, empty -> EmptyState, else children.
 */
export default function AsyncBoundary({
  isLoading,
  isError,
  error,
  onRetry,
  isEmpty = false,
  skeleton = null,
  emptyTitle,
  emptyMessage,
  children,
}) {
  if (isLoading) return skeleton;
  if (isError) return <ErrorState error={error} onRetry={onRetry} />;
  if (isEmpty) return <EmptyState title={emptyTitle} message={emptyMessage} />;
  return children;
}
