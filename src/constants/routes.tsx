import { createBrowserRouter } from 'react-router';

import { ProtectedLayout } from '@/components/protected-layout';
import { ProfilePage } from '@/pages/profile';
import { RegisterPage } from '@/pages/register';
import { RoomPage } from '@/pages/room';
import { TransactionsPage } from '@/pages/transactions';

import { LayoutApp } from '../components/base-layout';
import { AuthPage } from '../pages/auth';
import { ExpensePage } from '../pages/expense';
import { HomePage } from '../pages/home';
import { NotFoundPage } from '../pages/not-found';
import { RoomsPage } from '../pages/rooms';
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
      { path: `${ROUTE_PATHS.room}/:id`, element: <RoomPage /> },
      { path: `${ROUTE_PATHS.room}/:id${ROUTE_PATHS.transactions}`, element: <TransactionsPage /> },
      { path: ROUTE_PATHS.rooms, element: <RoomsPage /> },
      { path: ROUTE_PATHS.statistics, element: <ExpensePage /> },
      { path: ROUTE_PATHS.profile, element: <ProfilePage /> },
    ],
  },
  { path: ROUTE_PATHS.auth, element: <AuthPage /> },
  { path: ROUTE_PATHS.register, element: <RegisterPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
