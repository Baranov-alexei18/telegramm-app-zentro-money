import { doc, runTransaction } from 'firebase/firestore';

import { COLLECTION_ROOM } from '@/constants/db';
import { applyRoomAdminTransfer } from '@/lib/transfer-room-admin-members';
import { RoomType } from '@/types/room';

import { db } from './config';

export const transferRoomAdmin = async (
  roomId: string,
  callerId: string,
  targetUserId: string
): Promise<RoomType['members']> => {
  if (!roomId) {
    throw new Error('Комната не найдена');
  }

  const roomRef = doc(db, COLLECTION_ROOM, roomId);

  return runTransaction(db, async (transaction) => {
    const snap = await transaction.get(roomRef);

    if (!snap.exists()) {
      throw new Error('Комната не найдена');
    }

    const nextMembers = applyRoomAdminTransfer(
      snap.data().members as RoomType['members'] | undefined,
      callerId,
      targetUserId
    );

    transaction.update(roomRef, { members: nextMembers });

    return nextMembers;
  });
};
