import React, { StrictMode, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { onAuthStateChanged } from 'firebase/auth';

import { AppLoader } from './components/app-loader';
import { ErrorBoundary } from './components/error-boundary';
import { Toasts } from './components/shared/toast';
import { notificationManager } from './components/shared/toast/utils';
import { router } from './constants/routes';
import { auth } from './services/firebase/config';
import { getDataUserById } from './services/firebase/getDataUserById';
import { syncGoogleUser } from './services/google/syncGoogleUser';
import { getTelegramUser } from './services/telegram/getTelegramUser';
import { syncTelegramUser } from './services/telegram/syncTelegramUser';
import { useUserStore } from './store/userStore';

export const App = () => {
  const { loading, setLoading, setUser } = useUserStore();

  useEffect(() => {
    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userFromGoogle = await syncGoogleUser({
            id: firebaseUser.uid,
            firstName: firebaseUser.displayName || '',
            lastName: '',
            email: firebaseUser.email || undefined,
            telegramId: null,
          });

          if (userFromGoogle) {
            const userData = await getDataUserById(userFromGoogle.id);
            setUser(userData);
            setLoading(false);
            return;
          }
        }

        const telegramUser = getTelegramUser();

        if (telegramUser) {
          const syncedUser = await syncTelegramUser(telegramUser);
          const userData = await getDataUserById(syncedUser.id);
          setUser(userData);
          setLoading(false);
          return;
        }

        setUser(null);
      } catch (err: any) {
        notificationManager.add({ title: err.message, type: 'error' }, { timeout: 2000 });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setLoading, setUser]);

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
