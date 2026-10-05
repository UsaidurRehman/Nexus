import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes.jsx';
import AppErrorBoundary from './components/common/AppErrorBoundary.jsx';
import { ENV, QUERY_DEFAULTS } from './config.js';

// Cache policy comes from config.js, not from here.
const queryClient = new QueryClient({ defaultOptions: { queries: QUERY_DEFAULTS } });

export default function App() {
  return (
    <AppErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter basename={ENV.ROUTER_BASENAME}>
            <AppRoutes />
          </BrowserRouter>
        </QueryClientProvider>
      </HelmetProvider>
    </AppErrorBoundary>
  );
}
