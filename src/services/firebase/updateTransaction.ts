import { doc, setDoc } from 'firebase/firestore';

import { COLLECTION_ROOM, SUB_COLLECTION_TRANSACTIONS } from '@/constants/db';
import { db } from '@/services/firebase/config';
import { TransactionFormValues } from '@/types/transaction';

export const updateTransaction = async (
  roomId: string,
  transactionId: string,
  data: TransactionFormValues
) => {
  try {
    const transactionRef = doc(
      db,
      `${COLLECTION_ROOM}/${roomId}/${SUB_COLLECTION_TRANSACTIONS}`,
      transactionId
    );

    await setDoc(transactionRef, data, { merge: false });
  } catch (error) {
    console.error('Ошибка при обновлении транзакции:', error);
    throw error;
  }
};
