import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

import { COLLECTION_ROOM, COLLECTION_USER } from '@/constants/db';
import { RoomType } from '@/types/room';

import { db } from './config';

export const getUserRooms = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, COLLECTION_USER, userId));

    if (!userDoc.exists()) return [];

    const userData = userDoc.data();
    const roomIds = userData.rooms || [];

    if (!roomIds.length) return [];

    const roomsQuery = query(collection(db, COLLECTION_ROOM), where('roomId', 'in', roomIds));

    const querySnapshot = await getDocs(roomsQuery);

    const rooms = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as RoomType[];

    return rooms;
  } catch (error) {
    console.error('Ошибка при получении комнат:', error);
    return [];
  }
};
