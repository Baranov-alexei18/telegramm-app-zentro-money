import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { getTelegramUser } from '@/services/telegram/getTelegramUser';
import { syncTelegramUser } from '@/services/telegram/syncTelegramUser';
import { TelegramUser } from '@/types/user';

type AuthContextValue = {
  telegramUser: TelegramUser | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  telegramUser: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getTelegramUser();

    if (user) {
      syncTelegramUser(user).then((syncedUser) => {
        setTelegramUser(syncedUser);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  return <AuthContext.Provider value={{ telegramUser, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
