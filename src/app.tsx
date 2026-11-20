import { StrictMode, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { onAuthStateChanged } from 'firebase/auth';

import { AppLoader } from '@/components/app-loader';
import { ErrorBoundary } from '@/components/error-boundary';
import { OfflineBanner } from '@/components/offline-banner';
import { Toasts } from '@/components/shared/toast';
import { notificationManager } from '@/components/shared/toast/utils';
import { router } from '@/constants/routes';
import { auth } from '@/services/firebase/config';
import { getDataUserById } from '@/services/firebase/getDataUserById';
import { syncGoogleUser } from '@/services/google/syncGoogleUser';
import { getTelegramUser } from '@/services/telegram/getTelegramUser';
import { syncTelegramUser } from '@/services/telegram/syncTelegramUser';
import { useRoomStore } from '@/store/roomStore';
import { useUserStore } from '@/store/userStore';

export const App = () => {
  const { loading, setLoading, setUser } = useUserStore();
  const { fetchUserRooms, resetUserRooms } = useRoomStore();

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
            if (userData?.id) {
              await fetchUserRooms(userData.id, { force: true }).catch((roomsError) => {
                console.error('Не удалось предзагрузить комнаты:', roomsError);
              });
            }
            setLoading(false);
            return;
          }
        }

        const telegramUser = getTelegramUser();

        if (telegramUser) {
          const syncedUser = await syncTelegramUser(telegramUser);
          const userData = await getDataUserById(syncedUser.id);
          setUser(userData);
          if (userData?.id) {
            await fetchUserRooms(userData.id, { force: true }).catch((roomsError) => {
              console.error('Не удалось предзагрузить комнаты:', roomsError);
            });
          }
          setLoading(false);
          return;
        }

        setUser(null);
        resetUserRooms();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Ошибка инициализации сессии';
        notificationManager.add({ title: message, type: 'error' }, { timeout: 2000 });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchUserRooms, resetUserRooms, setLoading, setUser]);

  if (loading) {
    return <AppLoader />;
  }

  return (
    <StrictMode>
      <ErrorBoundary>
        <OfflineBanner />
        <RouterProvider router={router} />

        <Toasts />
      </ErrorBoundary>
    </StrictMode>
  );
};
