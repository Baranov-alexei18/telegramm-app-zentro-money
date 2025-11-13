import { FC, ReactNode } from 'react';
import { Navigate } from 'react-router';

import { ROUTE_PATHS } from '@/constants/route-path';
import { useUserStore } from '@/store/userStore';

type Props = {
  children: ReactNode;
};

export const ProtectedLayout: FC<Props> = ({ children }) => {
  const { user } = useUserStore();

  if (!user) return <Navigate to={ROUTE_PATHS.auth} replace />;

  return children;
};
