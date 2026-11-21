import { Timestamp } from 'firebase/firestore';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import {
  OutboxEntryType,
  OutboxOperation,
  OutboxStoragePortType,
  RemoteTransactionGatewayType,
} from '@/types/outbox';
import { SyncStatus, TransactionProps } from '@/types/transaction';

import { createOutboxFlusher } from './outbox-flusher';

const createTx = (overrides: Partial<TransactionProps> = {}): TransactionProps => ({
  transactionId: 'tx-1',
  roomId: 'room-1',
  userId: 'user-1',
  type: TRANSACTION_TYPE.EXPENSE,
  amount: 300,
  description: 'Метро',
  syncStatus: SyncStatus.PENDING,
  date: Timestamp.fromMillis(1_700_000_000_000),
  category: { id: 'cat-1', name: 'Транспорт', color: '#3b82f6', type: TRANSACTION_TYPE.EXPENSE },
  ...overrides,
});

const createMemoryStorage = (initial: OutboxEntryType[] = []): OutboxStoragePortType => {
  const map = new Map<string, OutboxEntryType>(initial.map((e) => [e.transactionId, e]));

  return {
    getById: vi.fn(async (id) => map.get(id) ?? null),
    getAll: vi.fn(async () => Array.from(map.values()).sort((a, b) => a.updatedAt - b.updatedAt)),
    getByRoom: vi.fn(async (roomId) =>
      Array.from(map.values())
        .filter((e) => e.roomId === roomId)
        .sort((a, b) => a.updatedAt - b.updatedAt)
    ),
    put: vi.fn(async (entry) => {
      map.set(entry.transactionId, entry);
    }),
    remove: vi.fn(async (id) => {
      map.delete(id);
    }),
  };
};

describe('createOutboxFlusher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('не должен обращаться к хранилищу и шлюзу, если isOnline возвращает false', async () => {
    const storage = createMemoryStorage([
      {
        transactionId: 'tx-1',
        roomId: 'room-1',
        op: OutboxOperation.CREATE,
        payload: createTx(),
        updatedAt: 100,
      },
    ]);
    const gateway: RemoteTransactionGatewayType = {
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    const flusher = createOutboxFlusher({
      storage,
      gateway,
      isOnline: () => false,
    });

    const synced = await flusher.requestFlush();

    expect(synced).toEqual([]);
    expect(gateway.create).not.toHaveBeenCalled();
    expect(await storage.getAll()).toHaveLength(1);
  });

  it('должен последовательно выгружать CREATE, UPDATE и DELETE, очищать Outbox и вызывать onEntrySynced', async () => {
    const storage = createMemoryStorage([
      {
        transactionId: 'tx-c',
        roomId: 'room-1',
        op: OutboxOperation.CREATE,
        payload: createTx({ transactionId: 'tx-c' }),
        updatedAt: 10,
      },
      {
        transactionId: 'tx-u',
        roomId: 'room-1',
        op: OutboxOperation.UPDATE,
        payload: createTx({ transactionId: 'tx-u', amount: 700 }),
        updatedAt: 20,
      },
      {
        transactionId: 'tx-d',
        roomId: 'room-2',
        op: OutboxOperation.DELETE,
        updatedAt: 30,
      },
    ]);

    const gateway: RemoteTransactionGatewayType = {
      create: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
    };
    const onEntrySynced = vi.fn();

    const flusher = createOutboxFlusher({
      storage,
      gateway,
      isOnline: () => true,
      onEntrySynced,
    });

    const synced = await flusher.requestFlush();

    expect(synced).toEqual(['tx-c', 'tx-u', 'tx-d']);
    expect(gateway.create).toHaveBeenCalledTimes(1);
    expect(gateway.update).toHaveBeenCalledTimes(1);
    expect(gateway.remove).toHaveBeenCalledWith('room-2', 'tx-d');
    expect(onEntrySynced).toHaveBeenCalledTimes(3);
    expect(await storage.getAll()).toHaveLength(0);
  });

  it('должен прерывать проход по таймауту при зависшем соединении (Lie-Fi), сохраняя запись в Outbox', async () => {
    vi.useFakeTimers();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const storage = createMemoryStorage([
      {
        transactionId: 'tx-hang',
        roomId: 'room-1',
        op: OutboxOperation.CREATE,
        payload: createTx({ transactionId: 'tx-hang' }),
        updatedAt: 100,
      },
    ]);

    const gateway: RemoteTransactionGatewayType = {
      create: vi.fn(() => new Promise<void>(() => undefined)),
      update: vi.fn(),
      remove: vi.fn(),
    };

    const flusher = createOutboxFlusher({
      storage,
      gateway,
      requestTimeoutMs: 6000,
      isOnline: () => true,
    });

    const flushPromise = flusher.requestFlush();
    await vi.advanceTimersByTimeAsync(6000);
    const synced = await flushPromise;

    expect(synced).toEqual([]);
    expect(await storage.getById('tx-hang')).not.toBeNull();

    warnSpy.mockRestore();
  });

  it('не должен удалять запись из Outbox после ответа шлюза, если updatedAt вырос во время полёта запроса, и должен доотправить новую версию', async () => {
    const storage = createMemoryStorage([
      {
        transactionId: 'tx-race',
        roomId: 'room-1',
        op: OutboxOperation.CREATE,
        payload: createTx({ transactionId: 'tx-race', amount: 100 }),
        updatedAt: 100,
      },
    ]);

    let callCount = 0;
    const gateway: RemoteTransactionGatewayType = {
      create: vi.fn(async (_roomId, payload) => {
        callCount += 1;
        if (callCount === 1) {
          // Имитируем правку пользователем прямо во время первого сетевого запроса
          await storage.put({
            transactionId: 'tx-race',
            roomId: 'room-1',
            op: OutboxOperation.CREATE,
            payload: createTx({ transactionId: 'tx-race', amount: 950 }),
            updatedAt: 200,
          });
        }
        void payload;
      }),
      update: vi.fn(),
      remove: vi.fn(),
    };

    const flusher = createOutboxFlusher({
      storage,
      gateway,
      isOnline: () => true,
    });

    const synced = await flusher.requestFlush();

    expect(gateway.create).toHaveBeenCalledTimes(2);
    expect(gateway.create).toHaveBeenLastCalledWith(
      'room-1',
      expect.objectContaining({ amount: 950 })
    );
    expect(synced).toEqual(['tx-race']);
    expect(await storage.getById('tx-race')).toBeNull();
  });
});
