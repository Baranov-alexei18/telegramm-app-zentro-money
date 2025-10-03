import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { ROUTE_PATHS } from '@/constants/route-path';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');

    if (!userId) {
      navigate(ROUTE_PATHS.auth);
    }
  }, [navigate]);

  return <div>{children}</div>;
};
