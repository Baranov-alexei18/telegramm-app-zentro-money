import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { COLLECTION_ROOM, SUB_COLLECTION_TRANSACTIONS } from '@/constants/db';
import { TransactionProps } from '@/types/transaction';

import { db } from './config';

export const createTransaction = async (
  roomId: string,
  transactionId: string,
  transaction: Omit<TransactionProps, 'transactionId'>
) => {
  try {
    const ref = doc(db, COLLECTION_ROOM, roomId, SUB_COLLECTION_TRANSACTIONS, transactionId);

    await setDoc(ref, {
      ...transaction,
      transactionId,
      createdAt: serverTimestamp(),
    });

    return transactionId;
  } catch (error) {
    console.error('Ошибка при создании транзакции:', error);
    throw error;
  }
};
