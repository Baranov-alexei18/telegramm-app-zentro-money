import { collection, getDocs, query, where } from 'firebase/firestore';

import { COLLECTION_USER } from '@/constants/db';
import { RoomUserRole } from '@/constants/room-roles';
import { RoomType } from '@/types/room';
import { UserType, UserWithRoleRoom } from '@/types/user';

import { db } from './config';

export const getRoomUsers = async (room: RoomType): Promise<UserWithRoleRoom[]> => {
  try {
    const members = room.members;
    const userIds = Object.keys(members || {});

    if (!userIds.length) return [];

    const chunks = [];

    for (let i = 0; i < userIds.length; i += 10) {
      chunks.push(userIds.slice(i, i + 10));
    }

    const users: UserWithRoleRoom[] = [];

    for (const chunk of chunks) {
      const q = query(collection(db, COLLECTION_USER), where('id', 'in', chunk));
      const snapshot = await getDocs(q);

      snapshot.forEach((doc) => {
        const userData = doc.data() as UserType;

        users.push({
          ...userData,
          id: doc.id,
          role: members[doc.id]?.role || RoomUserRole.USER,
        });
      });
    }

    return users;
  } catch (error) {
    console.error('Ошибка при получении пользователей комнаты:', error);
    return [];
  }
};
