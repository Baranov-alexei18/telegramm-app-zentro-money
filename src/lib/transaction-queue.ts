import { Timestamp } from 'firebase/firestore';

import { SUB_COLLECTION_TRANSACTIONS } from '@/constants/db';
import { SyncStatus, TransactionProps } from '@/types/transaction';

import { dbPromise } from './offline-db';

type LegacyQueuedTransactionRecord = {
  roomId?: string;
  transaction?: Partial<TransactionProps>;
};

type SerializedTimestampRecord = {
  seconds?: unknown;
  nanoseconds?: unknown;
  _seconds?: unknown;
  _nanoseconds?: unknown;
};

export const restoreTimestamp = (value: unknown): Timestamp | undefined => {
  if (!value) {
    return undefined;
  }

  if (value instanceof Timestamp) {
    return value;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : Timestamp.fromDate(value);
  }

  if (typeof value === 'object') {
    const candidate = value as SerializedTimestampRecord;
    const rawSeconds =
      typeof candidate.seconds === 'number'
        ? candidate.seconds
        : typeof candidate._seconds === 'number'
          ? candidate._seconds
          : undefined;

    if (rawSeconds !== undefined && Number.isFinite(rawSeconds)) {
      const rawNanoseconds =
        typeof candidate.nanoseconds === 'number'
          ? candidate.nanoseconds
          : typeof candidate._nanoseconds === 'number'
            ? candidate._nanoseconds
            : 0;

      return new Timestamp(rawSeconds, Number.isFinite(rawNanoseconds) ? rawNanoseconds : 0);
    }
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return Timestamp.fromMillis(value);
  }

  if (typeof value === 'string' && value.trim()) {
    const parsedDate = new Date(value);
    if (!Number.isNaN(parsedDate.getTime())) {
      return Timestamp.fromDate(parsedDate);
    }
  }

  return undefined;
};

export const normalizeQueuedTransaction = (record: unknown): TransactionProps | null => {
  if (!record || typeof record !== 'object') {
    return null;
  }

  let rawTx: Partial<TransactionProps> | undefined;
  let fallbackRoomId = '';

  if ('transaction' in record) {
    const legacy = record as LegacyQueuedTransactionRecord;
    rawTx = legacy.transaction;
    fallbackRoomId = legacy.roomId || '';
  } else {
    rawTx = record as Partial<TransactionProps>;
  }

  if (!rawTx || typeof rawTx !== 'object' || typeof rawTx.transactionId !== 'string') {
    return null;
  }

  const restoredDate = restoreTimestamp(rawTx.date);
  const restoredCreatedAt = restoreTimestamp(rawTx.createdAt);

  return {
    ...(rawTx as TransactionProps),
    roomId: rawTx.roomId || fallbackRoomId,
    ...(restoredDate ? { date: restoredDate } : {}),
    ...(restoredCreatedAt ? { createdAt: restoredCreatedAt } : {}),
    syncStatus: SyncStatus.PENDING,
  };
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
