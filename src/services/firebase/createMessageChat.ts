import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { COLLECTION_ROOM, SUB_COLLECTION_MESSAGES } from '@/constants/db';
import { UserType } from '@/types/user';
import { getUsername } from '@/utils/getUsername';

import { db } from './config';

export const createMessageChat = async (user: UserType, roomId: string, text: string) => {
  try {
    await addDoc(collection(db, COLLECTION_ROOM, roomId, SUB_COLLECTION_MESSAGES), {
      text,
      senderId: user.id,
      senderName: getUsername(user),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Ошибка при создании комнаты:', error);
  }
};
