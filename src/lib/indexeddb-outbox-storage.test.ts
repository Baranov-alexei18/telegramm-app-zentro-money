import { Timestamp } from 'firebase/firestore';
import { IDBPDatabase } from 'idb';
import { describe, expect, it, vi } from 'vitest';

import { INDEX_OUTBOX_BY_ROOM, OBJECT_STORE_TRANSACTION_OUTBOX } from '@/constants/db';
import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { OutboxEntryType, OutboxOperation } from '@/types/outbox';
import { SyncStatus, TransactionProps } from '@/types/transaction';

import { createIndexedDbOutboxStorage, normalizeOutboxEntry } from './indexeddb-outbox-storage';

const createTxPayload = (overrides: Partial<TransactionProps> = {}): TransactionProps => ({
  transactionId: 'tx-1',
  roomId: 'room-1',
  userId: 'user-1',
  type: TRANSACTION_TYPE.EXPENSE,
  amount: 600,
  description: 'Ужин',
  date: Timestamp.fromMillis(1_700_000_000_000),
  category: { id: 'cat-1', name: 'Еда', color: '#ef4444', type: TRANSACTION_TYPE.EXPENSE },
  ...overrides,
});

describe('normalizeOutboxEntry', () => {
  it('должен восстанавливать Timestamp внутри payload и выставлять статус PENDING для CREATE/UPDATE', () => {
    const raw = {
      transactionId: 'tx-1',
      roomId: 'room-1',
      op: OutboxOperation.UPDATE,
      updatedAt: 500,
      payload: {
        ...createTxPayload(),
        date: { seconds: 1_700_000_000, nanoseconds: 0 },
      },
    };

    const normalized = normalizeOutboxEntry(raw);

    expect(normalized?.op).toBe(OutboxOperation.UPDATE);
    expect(normalized?.payload?.date).toBeInstanceOf(Timestamp);
    expect(normalized?.payload?.syncStatus).toBe(SyncStatus.PENDING);
  });

  it('должен корректно нормализовать запись DELETE без payload и отбрасывать битые записи', () => {
    const deleteEntry = normalizeOutboxEntry({
      transactionId: 'tx-del',
      roomId: 'room-1',
      op: OutboxOperation.DELETE,
      updatedAt: 700,
    });

    expect(deleteEntry).toEqual({
      transactionId: 'tx-del',
      roomId: 'room-1',
      op: OutboxOperation.DELETE,
      updatedAt: 700,
    });
    expect(
      normalizeOutboxEntry({ transactionId: 'tx-bad', roomId: 'room-1', op: 'create' })
    ).toBeNull();
    expect(normalizeOutboxEntry(null)).toBeNull();
  });
});

describe('createIndexedDbOutboxStorage', () => {
  it('должен сохранять, удалять и читать записи с сортировкой по updatedAt и выборкой по индексу комнаты', async () => {
    const storeMap = new Map<string, OutboxEntryType>();

    const mockDb = {
      get: vi.fn(async (_store: string, key: string) => storeMap.get(key)),
      getAll: vi.fn(async () => Array.from(storeMap.values())),
      getAllFromIndex: vi.fn(async (_store: string, _index: string, roomId: string) =>
        Array.from(storeMap.values()).filter((item) => item.roomId === roomId)
      ),
      put: vi.fn(async (_store: string, value: OutboxEntryType) => {
        storeMap.set(value.transactionId, value);
      }),
      delete: vi.fn(async (_store: string, key: string) => {
        storeMap.delete(key);
      }),
    } as unknown as IDBPDatabase;

    const storage = createIndexedDbOutboxStorage(() => Promise.resolve(mockDb));

    await storage.put({
      transactionId: 'tx-late',
      roomId: 'room-1',
      op: OutboxOperation.CREATE,
      payload: createTxPayload({ transactionId: 'tx-late' }),
      updatedAt: 200,
    });
    await storage.put({
      transactionId: 'tx-early',
      roomId: 'room-1',
      op: OutboxOperation.DELETE,
      updatedAt: 100,
    });
    await storage.put({
      transactionId: 'tx-other-room',
      roomId: 'room-2',
      op: OutboxOperation.DELETE,
      updatedAt: 150,
    });

    const room1Entries = await storage.getByRoom('room-1');
    expect(mockDb.getAllFromIndex).toHaveBeenCalledWith(
      OBJECT_STORE_TRANSACTION_OUTBOX,
      INDEX_OUTBOX_BY_ROOM,
      'room-1'
    );
    expect(room1Entries.map((e) => e.transactionId)).toEqual(['tx-early', 'tx-late']);

    const allEntries = await storage.getAll();
    expect(allEntries.map((e) => e.transactionId)).toEqual([
      'tx-early',
      'tx-other-room',
      'tx-late',
    ]);

    await storage.remove('tx-early');
    expect(await storage.getById('tx-early')).toBeNull();
  });
});
