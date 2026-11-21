import { Timestamp } from 'firebase/firestore';

import { SyncStatus, TransactionProps } from '@/types/transaction';

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

  if (typeof Timestamp === 'function' && value instanceof Timestamp) {
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

      const safeNanoseconds = Number.isFinite(rawNanoseconds) ? rawNanoseconds : 0;

      if (typeof Timestamp === 'function') {
        return new Timestamp(rawSeconds, safeNanoseconds);
      }

      return { seconds: rawSeconds, nanoseconds: safeNanoseconds } as unknown as Timestamp;
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

export const normalizeTransactionTimestamps = (tx: TransactionProps): TransactionProps => {
  const restoredDate = restoreTimestamp(tx.date);
  const restoredCreatedAt = restoreTimestamp(tx.createdAt);

  return {
    ...tx,
    ...(restoredDate ? { date: restoredDate } : {}),
    ...(restoredCreatedAt ? { createdAt: restoredCreatedAt } : {}),
  };
};

export const normalizeLegacyTransactionRecord = (record: unknown): TransactionProps | null => {
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

  const resolvedRoomId = rawTx.roomId || fallbackRoomId;
  if (!resolvedRoomId || !rawTx.transactionId) {
    return null;
  }

  return normalizeTransactionTimestamps({
    ...(rawTx as TransactionProps),
    roomId: resolvedRoomId,
    syncStatus: SyncStatus.PENDING,
  });
};
