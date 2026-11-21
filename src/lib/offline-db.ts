import { IDBPDatabase, IDBPTransaction, openDB } from 'idb';

import {
  INDEX_DB_NAME,
  INDEX_OUTBOX_BY_ROOM,
  OBJECT_STORE_TRANSACTION_OUTBOX,
  SUB_COLLECTION_TRANSACTIONS,
} from '@/constants/db';
import { OutboxEntryType, OutboxOperation } from '@/types/outbox';

import { normalizeLegacyTransactionRecord } from './restore-timestamp';

export const migrateLegacyRecordsToOutboxEntries = (
  rawRecords: unknown[],
  baseTimestamp = Date.now()
): OutboxEntryType[] => {
  return rawRecords
    .map((record, index): OutboxEntryType | null => {
      const normalized = normalizeLegacyTransactionRecord(record);
      if (!normalized) {
        return null;
      }

      return {
        transactionId: normalized.transactionId,
        roomId: normalized.roomId,
        op: OutboxOperation.CREATE,
        payload: normalized,
        updatedAt: baseTimestamp + index,
      };
    })
    .filter((entry): entry is OutboxEntryType => entry !== null);
};

export const upgradeOfflineDb = async (
  db: IDBPDatabase,
  oldVersion: number,
  _newVersion: number | null,
  transaction: IDBPTransaction<unknown, string[], 'versionchange'>
) => {
  if (!db.objectStoreNames.contains(OBJECT_STORE_TRANSACTION_OUTBOX)) {
    const outboxStore = db.createObjectStore(OBJECT_STORE_TRANSACTION_OUTBOX, {
      keyPath: 'transactionId',
    });
    outboxStore.createIndex(INDEX_OUTBOX_BY_ROOM, 'roomId');
  }

  if (oldVersion < 2 && db.objectStoreNames.contains(SUB_COLLECTION_TRANSACTIONS)) {
    const legacyStore = transaction.objectStore(SUB_COLLECTION_TRANSACTIONS);
    const outboxStore = transaction.objectStore(OBJECT_STORE_TRANSACTION_OUTBOX);
    const legacyRecords = await legacyStore.getAll();
    const migratedEntries = migrateLegacyRecordsToOutboxEntries(legacyRecords);

    for (const entry of migratedEntries) {
      await outboxStore.put(entry);
    }

    try {
      db.deleteObjectStore(SUB_COLLECTION_TRANSACTIONS);
    } catch {
      // Игнорируем, если старое хранилище уже удалено
    }
  }
};

let cachedDbPromise: Promise<IDBPDatabase> | null = null;

export const getOfflineDb = (): Promise<IDBPDatabase> => {
  if (!cachedDbPromise) {
    cachedDbPromise = openDB(INDEX_DB_NAME, 2, {
      upgrade: upgradeOfflineDb,
    });
  }

  return cachedDbPromise;
};
