import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

import { COLLECTION_ROOM, COLLECTION_USER } from '@/constants/db';
import { RoomType } from '@/types/room';

import { db } from './config';
import { ensureRoomKind } from './ensureRoomKind';

export const getUserRooms = async (userId: string): Promise<RoomType[]> => {
  try {
    const userDoc = await getDoc(doc(db, COLLECTION_USER, userId));

    if (!userDoc.exists()) return [];

    const userData = userDoc.data();
    const roomIds: string[] = userData.rooms || [];

    if (!roomIds.length) return [];

    const roomsQuery = query(collection(db, COLLECTION_ROOM), where('roomId', 'in', roomIds));

    const querySnapshot = await getDocs(roomsQuery);

    const rooms = querySnapshot.docs.map((roomDoc) => ({
      roomId: roomDoc.id,
      ...roomDoc.data(),
    })) as RoomType[];

    return Promise.all(rooms.map((room) => ensureRoomKind(room)));
  } catch (error) {
    console.error('Ошибка при получении комнат:', error);
    throw error;
  }
};
