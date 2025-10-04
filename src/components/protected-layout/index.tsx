import { FC, ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router';

import { ROUTE_PATHS } from '@/constants/route-path';
import { useAuth } from '@/hooks/useAuth';

type Props = {
  children: ReactNode;
};

export const ProtectedLayout: FC<Props> = () => {
  const { telegramUser, loading } = useAuth();

  if (loading) return <div>Загрузка...</div>;

  if (!telegramUser) return <Navigate to={ROUTE_PATHS.auth} replace />;

  return <Outlet />;
};
