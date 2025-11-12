import { doc, updateDoc } from 'firebase/firestore';

import { notificationManager } from '@/components/shared/toast/utils';
import { COLLECTION_ROOM } from '@/constants/db';
import { RoomType } from '@/types/room';

import { db } from './config';

export const removeNotificationRoom = async (userId: string, room: RoomType) => {
  if (!room) throw new Error('Комната не найдена');

  const roomRef = doc(db, COLLECTION_ROOM, room.id);

  try {
    const updatedNotifications = room.notifications?.filter((n) => n.userId !== userId) || [];

    await updateDoc(roomRef, { notifications: updatedNotifications });

    return updatedNotifications;
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
