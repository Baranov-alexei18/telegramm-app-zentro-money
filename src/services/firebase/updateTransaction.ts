import { doc, setDoc } from 'firebase/firestore';

import { COLLECTION_ROOM, SUB_COLLECTION_TRANSACTIONS } from '@/constants/db';
import { db } from '@/services/firebase/config';
import { TransactionFormValues, TransactionProps } from '@/types/transaction';

export const updateTransaction = async (
  roomId: string,
  transactionId: string,
  data: TransactionFormValues | TransactionProps
) => {
  try {
    const transactionRef = doc(
      db,
      `${COLLECTION_ROOM}/${roomId}/${SUB_COLLECTION_TRANSACTIONS}`,
      transactionId
    );

    const persistedData = { ...data } as Partial<TransactionProps>;
    delete persistedData.syncStatus;

    await setDoc(transactionRef, persistedData, { merge: false });
  } catch (error) {
    console.error('Ошибка при обновлении транзакции:', error);
    throw error;
  }
};
