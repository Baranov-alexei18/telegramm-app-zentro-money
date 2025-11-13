import { StrictMode, useEffect } from 'react';
import { RouterProvider } from 'react-router';

import { AppLoader } from './components/app-loader';
import { ErrorBoundary } from './components/error-boundary';
import { Toasts } from './components/shared/toast';
import { notificationManager } from './components/shared/toast/utils';
import { router } from './constants/routes';
import { getDataUserById } from './services/firebase/getDataUserById';
import { getTelegramUser } from './services/telegram/getTelegramUser';
import { syncTelegramUser } from './services/telegram/syncTelegramUser';
import { useUserStore } from './store/userStore';

export const App = () => {
  const { loading, setLoading, setUser } = useUserStore();

  useEffect(() => {
    const auth = async () => {
      setLoading(true);

      const telegramUser = getTelegramUser();

      if (!telegramUser) {
        setLoading(false);

        return;
      }

      try {
        const syncedUser = await syncTelegramUser(telegramUser);

        const userData = await getDataUserById(syncedUser.id);

        setUser(userData);
      } catch (err: any) {
        notificationManager.add(
          {
            title: err.message,
            type: 'error',
          },
          { timeout: 2000 }
        );
      } finally {
        setLoading(false);
      }
    };

    auth();
  }, []);

  if (loading) {
    return <AppLoader />;
  }

  return (
    <StrictMode>
      <ErrorBoundary>
        <RouterProvider router={router} />

        <Toasts />
      </ErrorBoundary>
    </StrictMode>
  );
};
