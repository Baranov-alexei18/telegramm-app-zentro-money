import { doc, updateDoc } from 'firebase/firestore';

import { COLLECTION_ROOM } from '@/constants/db';
import { RoomKind } from '@/constants/room-kind';

import { db } from './config';

export type UpdateRoomPatch = {
  name?: string;
  description?: string;
  kind?: RoomKind;
  coverGradientId?: string;
  iconId?: string;
  iconColorId?: string;
};

export const updateRoom = async (
  roomId: string,
  patch: UpdateRoomPatch
): Promise<UpdateRoomPatch> => {
  if (!roomId) {
    throw new Error('roomId не указан');
  }

  const payload: UpdateRoomPatch = {};

  if (patch.name !== undefined) {
    payload.name = patch.name.trim();
  }

  if (patch.description !== undefined) {
    payload.description = patch.description;
  }

  if (patch.kind !== undefined) {
    payload.kind = patch.kind;
  }

  if (patch.coverGradientId !== undefined) {
    payload.coverGradientId = patch.coverGradientId;
  }

  if (patch.iconId !== undefined) {
    payload.iconId = patch.iconId;
  }

  if (patch.iconColorId !== undefined) {
    payload.iconColorId = patch.iconColorId;
  }

  if (Object.keys(payload).length === 0) {
    return payload;
  }

  try {
    await updateDoc(doc(db, COLLECTION_ROOM, roomId), payload);
    return payload;
  } catch (error) {
    console.error('Ошибка при обновлении комнаты:', error);
    throw error;
  }
};
