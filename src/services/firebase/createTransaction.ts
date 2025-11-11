import { addDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';

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

    const docRef = await addDoc(transactionsRef, {
      ...transaction,
      createdAt: serverTimestamp(),
    });

    await updateDoc(docRef, {
      transactionId: docRef.id,
    });

    return docRef.id;
  } catch (error) {
    console.error('Ошибка при создании транзакции:', error);
    throw error;
  }
};
