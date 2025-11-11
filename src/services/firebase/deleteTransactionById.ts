import { deleteDoc, doc } from 'firebase/firestore';

import { COLLECTION_ROOM, SUB_COLLECTION_TRANSACTIONS } from '@/constants/db';

import { db } from './config';

export const deleteTransactionById = async (roomId: string, transactionId: string) => {
  try {
    if (!roomId) throw new Error('roomId не указан');

    const transactionRef = doc(
      db,
      COLLECTION_ROOM,
      roomId,
      SUB_COLLECTION_TRANSACTIONS,
      transactionId
    );

    await deleteDoc(transactionRef);
  } catch (error) {
    console.error('Ошибка при удалении категории:', error);
    throw error;
  }
};
