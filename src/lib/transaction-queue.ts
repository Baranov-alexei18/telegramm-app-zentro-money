import { SUB_COLLECTION_TRANSACTIONS } from '@/constants/db';
import { TransactionProps } from '@/types/transaction';

import { dbPromise } from './offline-db';

export const queueTransaction = async (tx: { roomId: string; transaction: TransactionProps }) => {
  const db = await dbPromise;
  await db.put(SUB_COLLECTION_TRANSACTIONS, tx.transaction);
};

export const getQueuedTransactions = async () => {
  const db = await dbPromise;
  return db.getAll(SUB_COLLECTION_TRANSACTIONS);
};

export const removeQueuedTransaction = async (id: string) => {
  const db = await dbPromise;
  await db.delete(SUB_COLLECTION_TRANSACTIONS, id);
};
