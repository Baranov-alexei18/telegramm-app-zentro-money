import { TelegramUser } from '@/types/user';

export const getTelegramUser = (): TelegramUser | null => {
  const tg = (window as any).Telegram?.WebApp;
  const user = tg?.initDataUnsafe?.user;

  if (!user?.id) return null;

  return {
    id: String(user.id),
    telegramId: String(user.id),
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username,
  };
};
