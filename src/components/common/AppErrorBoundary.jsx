import { Component } from 'react';
import ErrorState from './ErrorState.jsx';

/** Top-level safety net so a render crash never shows a blank white page. */
export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Hook a reporter (Sentry etc.) in here when one is configured.
    // eslint-disable-next-line no-console
    console.error('[nexus] render error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-nexus-ink px-5">
          <ErrorState
            title="The page could not be displayed"
            error={{ message: 'An unexpected error occurred while rendering this page.' }}
            onRetry={() => window.location.reload()}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
