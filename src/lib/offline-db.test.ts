import { Timestamp } from 'firebase/firestore';
import { IDBPDatabase, IDBPTransaction } from 'idb';
import { describe, expect, it, vi } from 'vitest';

import {
  INDEX_OUTBOX_BY_ROOM,
  OBJECT_STORE_TRANSACTION_OUTBOX,
  SUB_COLLECTION_TRANSACTIONS,
} from '@/constants/db';
import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { OutboxOperation } from '@/types/outbox';

import { migrateLegacyRecordsToOutboxEntries, upgradeOfflineDb } from './offline-db';

describe('migrateLegacyRecordsToOutboxEntries', () => {
  it('должен преобразовывать записи v1 в элементы Outbox с операцией CREATE и возрастающим updatedAt', () => {
    const legacyRecords = [
      {
        transactionId: 'tx-1',
        roomId: 'room-1',
        userId: 'user-1',
        type: TRANSACTION_TYPE.EXPENSE,
        amount: 250,
        description: 'Чай',
        date: { seconds: 1_700_000_000, nanoseconds: 0 },
        category: { id: 'cat-1', name: 'Еда', color: '#ef4444', type: TRANSACTION_TYPE.EXPENSE },
      },
      null,
      { invalid: true },
    ];

    const entries = migrateLegacyRecordsToOutboxEntries(legacyRecords, 1000);

    expect(entries).toHaveLength(1);
    expect(entries[0]?.op).toBe(OutboxOperation.CREATE);
    expect(entries[0]?.transactionId).toBe('tx-1');
    expect(entries[0]?.roomId).toBe('room-1');
    expect(entries[0]?.updatedAt).toBe(1000);
    expect(entries[0]?.payload?.date).toBeInstanceOf(Timestamp);
  });
});

describe('upgradeOfflineDb', () => {
  it('должен создавать transaction_outbox с индексом by_room и мигрировать данные из старого хранилища transactions', async () => {
    const createIndex = vi.fn();
    const put = vi.fn().mockResolvedValue(undefined);
    const getAll = vi.fn().mockResolvedValue([
      {
        transactionId: 'tx-legacy',
        roomId: 'room-42',
        userId: 'user-1',
        type: TRANSACTION_TYPE.INCOME,
        amount: 5000,
        description: 'Аванс',
        date: { seconds: 1_700_000_000, nanoseconds: 0 },
        category: {
          id: 'cat-2',
          name: 'Зарплата',
          color: '#22c55e',
          type: TRANSACTION_TYPE.INCOME,
        },
      },
    ]);
    const deleteObjectStore = vi.fn();
    const createObjectStore = vi.fn().mockReturnValue({ createIndex });

    const mockDb = {
      objectStoreNames: {
        contains: (name: string) => name === SUB_COLLECTION_TRANSACTIONS,
      },
      createObjectStore,
      deleteObjectStore,
    } as unknown as IDBPDatabase;

    const mockTx = {
      objectStore: (name: string) => {
        if (name === SUB_COLLECTION_TRANSACTIONS) {
          return { getAll };
        }
        return { put };
      },
    } as unknown as IDBPTransaction<unknown, string[], 'versionchange'>;

    await upgradeOfflineDb(mockDb, 1, 2, mockTx);

    expect(createObjectStore).toHaveBeenCalledWith(OBJECT_STORE_TRANSACTION_OUTBOX, {
      keyPath: 'transactionId',
    });
    expect(createIndex).toHaveBeenCalledWith(INDEX_OUTBOX_BY_ROOM, 'roomId');
    expect(put).toHaveBeenCalledTimes(1);
    expect(put.mock.calls[0]?.[0]).toMatchObject({
      transactionId: 'tx-legacy',
      roomId: 'room-42',
      op: OutboxOperation.CREATE,
    });
    expect(deleteObjectStore).toHaveBeenCalledWith(SUB_COLLECTION_TRANSACTIONS);
  });
});
