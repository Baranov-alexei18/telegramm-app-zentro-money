import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import { ErrorBoundary } from './components/error-boundary/index.tsx';
import { router } from './constants/routes.tsx';
import { AuthProvider } from './hooks/useAuth.tsx';

import './global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
