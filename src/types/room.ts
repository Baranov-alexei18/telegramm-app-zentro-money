import { RoomUserRole } from '@/constants/room-roles';

import { CategoryType } from './category';
import { TransactionProps } from './transaction';

export enum PermissionRoom {
  NOTIFICATION_VIEW = 'NOTIFICATION_VIEW',

  TRANSACTION_CREATE = 'TRANSACTION_CREATE',
  TRANSACTION_UPDATE = 'TRANSACTION_UPDATE',
  TRANSACTION_DELETE = 'TRANSACTION_DELETE',

  CATEGORY_CREATE = 'CATEGORY_CREATE',
  CATEGORY_UPDATE = 'CATEGORY_UPDATE',
  CATEGORY_DELETE = 'CATEGORY_DELETE',

  REMOVE_USER = 'REMOVE_USER',
}

export type NotificationRoomType = {
  userId: string;
  name?: string;
  email?: string;
  type?: string;
};

export type RoomType = {
  roomId: string;
  name: string;
  members: Record<
    string,
    {
      joineredAt: Date;
      role: RoomUserRole;
    }
  >;
  notifications?: NotificationRoomType[];
  description: string;
  transactions?: TransactionProps[];
  categories: CategoryType[];
};
