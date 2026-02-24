import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { COLLECTION_ROOM, SUB_COLLECTION_TRANSACTIONS } from '@/constants/db';
import { TransactionProps } from '@/types/transaction';

import { db } from './config';

export const createTransaction = async (
  roomId: string,
  transaction: Omit<TransactionProps, 'transactionId'>
) => {
  try {
    if (!roomId) throw new Error('roomId не указан');

    const transactionsRef = collection(db, COLLECTION_ROOM, roomId, SUB_COLLECTION_TRANSACTIONS);

    const newDocRef = doc(transactionsRef);
    const newId = newDocRef.id;

    await setDoc(newDocRef, {
      ...transaction,
      transactionId: newId,
      createdAt: serverTimestamp(),
    });

    return newId;
  } catch (error) {
    console.error('Ошибка при создании транзакции:', error);
    throw error;
  }
};
