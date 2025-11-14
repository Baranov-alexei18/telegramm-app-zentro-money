import { arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';

import { notificationManager } from '@/components/shared/toast/utils';
import { COLLECTION_ROOM, COLLECTION_USER } from '@/constants/db';
import { RoomUserRole } from '@/constants/room-roles';
import { RoomType } from '@/types/room';

import { db } from './config';

export const joinUserToRoom = async (userId: string, room: RoomType) => {
  if (!room) throw new Error('Комната не найдена');

  const roomRef = doc(db, COLLECTION_ROOM, room.roomId);
  const userRef = doc(db, COLLECTION_USER, userId);

  const alreadyInRoom = !!room.members?.[userId];

  if (alreadyInRoom) throw new Error('Пользователь уже в комнате');

  try {
    const updatedMembers: RoomType['members'] = {
      ...room.members,
      [userId]: { role: RoomUserRole.USER, joineredAt: new Date() },
    };

    const updatedNotifications: RoomType['notifications'] =
      room.notifications?.filter((n) => n.userId !== userId) || [];

    await updateDoc(roomRef, {
      members: updatedMembers,
      notifications: updatedNotifications,
    });

    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error('Пользователь не найден в коллекции пользователей');
    }

    await updateDoc(userRef, {
      rooms: arrayUnion(room.roomId),
    });

    return {
      members: updatedMembers,
      notifications: updatedNotifications,
    };
  } catch (err: any) {
    notificationManager.add(
      {
        title: err.message,
        type: 'ok',
      },
      { timeout: 1000 }
    );
  }
};
