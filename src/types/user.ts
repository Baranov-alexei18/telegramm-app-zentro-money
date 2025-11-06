export type UserType = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  telegramId: string | null;
  username?: string;
  rooms?: any[];
};

export type TelegramUser = {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  telegramId?: string;
};
