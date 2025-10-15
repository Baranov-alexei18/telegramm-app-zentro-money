import { createBrowserRouter } from 'react-router';

import { ProtectedLayout } from '@/components/protected-layout';
import { EditPage } from '@/pages/edit';
import { RegisterPage } from '@/pages/register';

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
      <ProtectedLayout>
        <LayoutApp />
      </ProtectedLayout>
    ),
    children: [
      { path: ROUTE_PATHS.main, element: <HomePage /> },
      { path: `${ROUTE_PATHS.room}/:id`, element: <HomePage /> },
      { path: ROUTE_PATHS.rooms, element: <IncomePage /> },
      { path: ROUTE_PATHS.statistics, element: <ExpensePage /> },
      { path: ROUTE_PATHS.profile, element: <EditPage /> },
    ],
  },
  { path: ROUTE_PATHS.auth, element: <AuthPage /> },
  { path: ROUTE_PATHS.register, element: <RegisterPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
