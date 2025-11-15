import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import { BASE_CATEGORIES } from '@/constants/category';
import { COLLECTION_ROOM, COLLECTION_USER } from '@/constants/db';
import { RoomUserRole } from '@/constants/room-roles';

import { db } from './config';

type CreateRoomParams = {
  userId: string;
  name: string;
  description?: string;
};

export const createRoom = async ({ userId, name, description }: CreateRoomParams) => {
  try {
    const roomRef = await addDoc(collection(db, COLLECTION_ROOM), {
      name,
      description: description || '',
      createdAt: serverTimestamp(),
      categories: BASE_CATEGORIES,
      members: {
        [userId]: {
          role: RoomUserRole.ADMIN,
          joinedAt: new Date(),
        },
      },
      transactions: [],
      notifications: [],
    });

    await updateDoc(roomRef, {
      roomId: roomRef.id,
    });

    const userRef = doc(db, COLLECTION_USER, userId);

    await updateDoc(userRef, {
      rooms: arrayUnion(roomRef.id),
    });

    return roomRef.id;
  } catch (error) {
    console.error('Ошибка при создании комнаты:', error);
    throw error;
  }
};
