import { Timestamp } from 'firebase/firestore';
import { describe, expect, it, vi } from 'vitest';

import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import {
  OutboxEntryType,
  OutboxStoragePortType,
  RemoteTransactionGatewayType,
} from '@/types/outbox';
import { SyncStatus, TransactionProps } from '@/types/transaction';

import { createTransactionRepository } from './transaction-repository';

const createTx = (overrides: Partial<TransactionProps> = {}): TransactionProps => ({
  transactionId: 'tx-1',
  roomId: 'room-1',
  userId: 'user-1',
  type: TRANSACTION_TYPE.EXPENSE,
  amount: 500,
  description: 'Продукты',
  syncStatus: SyncStatus.PENDING,
  date: Timestamp.fromMillis(1_700_000_000_000),
  category: { id: 'cat-1', name: 'Еда', color: '#ef4444', type: TRANSACTION_TYPE.EXPENSE },
  ...overrides,
});

const createInMemoryStorage = (): OutboxStoragePortType => {
  const map = new Map<string, OutboxEntryType>();

  return {
    getById: async (id) => map.get(id) ?? null,
    getAll: async () => Array.from(map.values()).sort((a, b) => a.updatedAt - b.updatedAt),
    getByRoom: async (roomId) =>
      Array.from(map.values())
        .filter((e) => e.roomId === roomId)
        .sort((a, b) => a.updatedAt - b.updatedAt),
    put: async (entry) => {
      map.set(entry.transactionId, entry);
    },
    remove: async (id) => {
      map.delete(id);
    },
  };
};

describe('createTransactionRepository', () => {
  it('должен в оффлайне схлопывать CREATE -> UPDATE в один CREATE и при онлайне отправлять финальную версию', async () => {
    let online = false;
    const storage = createInMemoryStorage();
    const gateway: RemoteTransactionGatewayType = {
      create: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
    };

    const repo = createTransactionRepository({
      storage,
      gateway,
      isOnline: () => online,
    });
    const syncedListener = vi.fn();
    repo.subscribeSynced(syncedListener);

    await repo.enqueueCreate('room-1', createTx({ transactionId: 'tx-10', amount: 300 }));
    await repo.enqueueUpdate('room-1', createTx({ transactionId: 'tx-10', amount: 850 }));

    expect(gateway.create).not.toHaveBeenCalled();
    expect(gateway.update).not.toHaveBeenCalled();

    const projectedOffline = await repo.hydrateRoomTransactions('room-1', []);
    expect(projectedOffline).toHaveLength(1);
    expect(projectedOffline[0]?.amount).toBe(850);

    online = true;
    const flushed = await repo.requestFlush();

    expect(flushed).toEqual(['tx-10']);
    expect(gateway.create).toHaveBeenCalledTimes(1);
    expect(gateway.create).toHaveBeenCalledWith(
      'room-1',
      expect.objectContaining({ transactionId: 'tx-10', amount: 850 })
    );
    expect(gateway.update).not.toHaveBeenCalled();
    expect(syncedListener).toHaveBeenCalledTimes(1);
  });

  it('должен взаимно уничтожать CREATE + DELETE в оффлайне без единого обращения к удалённому шлюзу', async () => {
    let online = false;
    const storage = createInMemoryStorage();
    const gateway: RemoteTransactionGatewayType = {
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    const repo = createTransactionRepository({
      storage,
      gateway,
      isOnline: () => online,
    });

    await repo.enqueueCreate('room-1', createTx({ transactionId: 'tx-temp' }));
    await repo.enqueueDelete('room-1', 'tx-temp');

    expect(await storage.getAll()).toHaveLength(0);

    online = true;
    const flushed = await repo.requestFlush();

    expect(flushed).toEqual([]);
    expect(gateway.create).not.toHaveBeenCalled();
    expect(gateway.remove).not.toHaveBeenCalled();
  });
});
