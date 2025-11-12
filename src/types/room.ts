import { CategoryType } from './category';
import { TransactionProps } from './transaction';

export enum RolesRoom {
  ADMIN = 'admin',
  USER = 'base_user',
}

export type NotificationRoomType = {
  userId: string;
  name?: string;
  email?: string;
  type?: string;
};

export type RoomType = {
  id: string;
  name: string;
  members: Record<
    string,
    {
      joineredAt: Date;
      role: RolesRoom;
    }
  >;
  notifications?: NotificationRoomType[];
  description: string;
  transactions?: TransactionProps[];
  categories: CategoryType[];
};
