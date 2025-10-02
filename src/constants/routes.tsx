import { createBrowserRouter } from 'react-router';

import { ProtectedRoute } from '@/components/protected-route';
import { EditPage } from '@/pages/edit';
import { GoalsPage } from '@/pages/goals';

import { LayoutApp } from '../components/base-layout';
import { AuthPage } from '../pages/auth';
import { ExpensePage } from '../pages/expense';
import { HomePage } from '../pages/home';
import { IncomePage } from '../pages/income';
import { NotFoundPage } from '../pages/not-found';
import { ROUTE_PATHS } from './route-path';

export const router = createBrowserRouter([
  {
    path: ROUTE_PATHS.main,
    element: (
      <ProtectedRoute>
        <LayoutApp />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        path: ROUTE_PATHS.home,
        element: (
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTE_PATHS.income,
        element: (
          <ProtectedRoute>
            <IncomePage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTE_PATHS.expense,
        element: (
          <ProtectedRoute>
            <ExpensePage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTE_PATHS.edit,
        element: (
          <ProtectedRoute>
            <EditPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTE_PATHS.goals,
        element: (
          <ProtectedRoute>
            <GoalsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: ROUTE_PATHS.auth, element: <AuthPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
