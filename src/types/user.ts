import { RoomUserRole } from '@/constants/room-roles';

import { RoomType } from './room';

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

export type UserWithRoleRoom = UserType & {
  role: RoomUserRole;
};

export type UpdateUserType = {
  firstName: string;
  lastName: string;
  email: string;
};
