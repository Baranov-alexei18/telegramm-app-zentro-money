import { arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';

import { notificationManager } from '@/components/shared/toast/utils';
import { COLLECTION_ROOM } from '@/constants/db';
import { UserType } from '@/types/user';

import { db } from './config';

export const sendJoinRoomRequest = async (roomId: string, user: UserType) => {
  try {
    const roomRef = doc(db, COLLECTION_ROOM, roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      throw new Error('Такой комнаты не существует');
    }

    const roomData = roomSnap.data();

    const members = roomData.members || {};

    if (members[user.id]) {
      throw new Error('Вы уже участник этой комнаты ⚠️');
    }

    const notifications = roomData.notifications || [];
    const alreadySent = notifications.some((n: any) => n.userId === user.id);

    if (alreadySent) {
      throw new Error('Запрос уже был отправлен ранее ⚠️');
    }

    const newNotification = {
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      type: 'join_request',
    };

    await updateDoc(roomRef, {
      notifications: arrayUnion(newNotification),
    });

    return { success: true, message: 'Запрос успешно отправлен ✅' };
  } catch (error: any) {
    notificationManager.add(
      {
        title: error.message,
        type: 'error',
      },
      { timeout: 1000 }
    );
  }
};
