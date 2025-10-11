import { FC, ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router';

import { ROUTE_PATHS } from '@/constants/route-path';
import { useUserStore } from '@/store/userStore';

type Props = {
  children: ReactNode;
};

export const ProtectedLayout: FC<Props> = () => {
  const { user, loading } = useUserStore();

  if (loading) return <div>Загрузка...</div>;

  if (!user) return <Navigate to={ROUTE_PATHS.auth} replace />;

  return <Outlet />;
};
