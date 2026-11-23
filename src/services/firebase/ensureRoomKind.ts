import { doc, updateDoc } from 'firebase/firestore';

import { COLLECTION_ROOM } from '@/constants/db';
import { RoomKind } from '@/constants/room-kind';
import { hasPersistedRoomKind } from '@/lib/resolve-room-kind';
import { RoomType } from '@/types/room';

import { db } from './config';

export const ensureRoomKind = async (room: RoomType): Promise<RoomType> => {
  if (hasPersistedRoomKind(room.kind)) {
    return room;
  }

  const kind = RoomKind.SHARED_EXPENSES;
  const nextRoom = { ...room, kind };

  try {
    await updateDoc(doc(db, COLLECTION_ROOM, room.roomId), { kind });
  } catch (error) {
    console.error('Не удалось сохранить тип комнаты:', error);
  }

  return nextRoom;
};
