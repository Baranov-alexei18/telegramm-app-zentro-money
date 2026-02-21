import { RoomUserRole } from '@/constants/room-roles';

export type UserType = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  telegramId: string | null;
  username?: string;
  rooms?: string[];
};

export type TelegramUser = {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  telegramId?: string;
};

export type GoogleUser = {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  email?: string;
  telegramId: null;
};

export type UserWithRoleRoom = UserType & {
  role: RoomUserRole;
};

export type UpdateUserType = {
  firstName: string;
  lastName: string;
  email: string;
};
