import { IDBPDatabase } from 'idb';

import { INDEX_OUTBOX_BY_ROOM, OBJECT_STORE_TRANSACTION_OUTBOX } from '@/constants/db';
import { OutboxEntryType, OutboxOperation, OutboxStoragePortType } from '@/types/outbox';
import { SyncStatus, TransactionProps } from '@/types/transaction';

import { getOfflineDb } from './offline-db';
import { normalizeTransactionTimestamps } from './restore-timestamp';

const isValidOutboxOperation = (value: unknown): value is OutboxOperation =>
  value === OutboxOperation.CREATE ||
  value === OutboxOperation.UPDATE ||
  value === OutboxOperation.DELETE;

export const normalizeOutboxEntry = (raw: unknown): OutboxEntryType | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const candidate = raw as Partial<OutboxEntryType>;

  if (
    typeof candidate.transactionId !== 'string' ||
    !candidate.transactionId ||
    typeof candidate.roomId !== 'string' ||
    !candidate.roomId ||
    !isValidOutboxOperation(candidate.op)
  ) {
    return null;
  }

  const updatedAt =
    typeof candidate.updatedAt === 'number' && Number.isFinite(candidate.updatedAt)
      ? candidate.updatedAt
      : 0;

  if (candidate.op === OutboxOperation.DELETE) {
    return {
      transactionId: candidate.transactionId,
      roomId: candidate.roomId,
      op: OutboxOperation.DELETE,
      updatedAt,
    };
  }

  if (!candidate.payload || typeof candidate.payload !== 'object') {
    return null;
  }

  const normalizedPayload = normalizeTransactionTimestamps({
    ...(candidate.payload as TransactionProps),
    transactionId: candidate.transactionId,
    roomId: candidate.roomId,
    syncStatus: SyncStatus.PENDING,
  });

  return {
    transactionId: candidate.transactionId,
    roomId: candidate.roomId,
    op: candidate.op,
    payload: normalizedPayload,
    updatedAt,
  };
};

const normalizeAndSortEntries = (records: unknown[]): OutboxEntryType[] =>
  records
    .map((record) => normalizeOutboxEntry(record))
    .filter((entry): entry is OutboxEntryType => entry !== null)
    .sort((a, b) => a.updatedAt - b.updatedAt);

export const createIndexedDbOutboxStorage = (
  resolveDb: () => Promise<IDBPDatabase> = getOfflineDb
): OutboxStoragePortType => ({
  getById: async (transactionId) => {
    const db = await resolveDb();
    const record = await db.get(OBJECT_STORE_TRANSACTION_OUTBOX, transactionId);
    return normalizeOutboxEntry(record);
  },

  getAll: async () => {
    const db = await resolveDb();
    const records = await db.getAll(OBJECT_STORE_TRANSACTION_OUTBOX);
    return normalizeAndSortEntries(records);
  },

  getByRoom: async (roomId) => {
    const db = await resolveDb();
    const records = await db.getAllFromIndex(
      OBJECT_STORE_TRANSACTION_OUTBOX,
      INDEX_OUTBOX_BY_ROOM,
      roomId
    );
    return normalizeAndSortEntries(records);
  },

  put: async (entry) => {
    const db = await resolveDb();
    await db.put(OBJECT_STORE_TRANSACTION_OUTBOX, entry);
  },

  remove: async (transactionId) => {
    const db = await resolveDb();
    await db.delete(OBJECT_STORE_TRANSACTION_OUTBOX, transactionId);
  },
});

export const indexedDbOutboxStorage = createIndexedDbOutboxStorage();
