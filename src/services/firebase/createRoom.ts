import { addDoc, arrayUnion, collection, doc, updateDoc } from 'firebase/firestore';

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
      createdAt: new Date(),
      members: {
        [userId]: {
          role: RoomUserRole.ADMIN,
          joinedAt: new Date(),
        },
      },
      categories: [],
      transactions: [],
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
