import { SUB_COLLECTION_TRANSACTIONS } from '@/constants/db';
import { TransactionProps } from '@/types/transaction';

import { dbPromise } from './offline-db';

type LegacyQueuedTransactionRecord = {
  roomId?: string;
  transaction?: TransactionProps;
};

export const normalizeQueuedTransaction = (record: unknown): TransactionProps | null => {
  if (!record || typeof record !== 'object') {
    return null;
  }

  if ('transaction' in record) {
    const legacy = record as LegacyQueuedTransactionRecord;
    const nestedTx = legacy.transaction;

    if (!nestedTx || typeof nestedTx !== 'object' || typeof nestedTx.transactionId !== 'string') {
      return null;
    }

    return {
      ...nestedTx,
      roomId: nestedTx.roomId || legacy.roomId || '',
    };
  }

  const directTx = record as Partial<TransactionProps>;

  if (typeof directTx.transactionId !== 'string') {
    return null;
  }

  return directTx as TransactionProps;
};

export const queueTransaction = async (tx: { roomId: string; transaction: TransactionProps }) => {
  const db = await dbPromise;
  await db.put(SUB_COLLECTION_TRANSACTIONS, {
    ...tx.transaction,
    roomId: tx.transaction.roomId || tx.roomId,
  });
};

export const getQueuedTransactions = async (): Promise<TransactionProps[]> => {
  const db = await dbPromise;
  const rawRecords = await db.getAll(SUB_COLLECTION_TRANSACTIONS);

  return rawRecords
    .map((record) => normalizeQueuedTransaction(record))
    .filter((tx): tx is TransactionProps => tx !== null);
};

export const removeQueuedTransaction = async (id: string) => {
  const db = await dbPromise;
  await db.delete(SUB_COLLECTION_TRANSACTIONS, id);
};
