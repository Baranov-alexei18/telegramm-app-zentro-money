import { Timestamp } from 'firebase/firestore';
import { describe, expect, it, vi } from 'vitest';

import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { SyncStatus, TransactionProps } from '@/types/transaction';

vi.mock('./offline-db', () => ({
  dbPromise: Promise.resolve({
    put: vi.fn(),
    getAll: vi.fn(),
    delete: vi.fn(),
  }),
}));

import { normalizeQueuedTransaction } from './transaction-queue';

const createMockTransaction = (overrides: Partial<TransactionProps> = {}): TransactionProps => ({
  transactionId: 'tx-1',
  roomId: 'room-1',
  userId: 'user-1',
  type: TRANSACTION_TYPE.EXPENSE,
  amount: 500,
  description: 'Кофе',
  date: Timestamp.fromMillis(1_700_000_000_000),
  syncStatus: SyncStatus.PENDING,
  category: {
    id: 'cat-1',
    name: 'Еда',
    color: '#ef4444',
    type: TRANSACTION_TYPE.EXPENSE,
  },
  ...overrides,
});

describe('normalizeQueuedTransaction', () => {
  it('должен возвращать транзакцию, если запись сохранена напрямую как TransactionProps', () => {
    const tx = createMockTransaction();

    expect(normalizeQueuedTransaction(tx)).toEqual(tx);
  });

  it('должен корректно извлекать транзакцию из обёртки { roomId, transaction }', () => {
    const tx = createMockTransaction({ roomId: '' });

    expect(normalizeQueuedTransaction({ roomId: 'room-legacy', transaction: tx })).toEqual({
      ...tx,
      roomId: 'room-legacy',
    });
  });

  it('должен возвращать null для некорректных записей в IndexedDB', () => {
    expect(normalizeQueuedTransaction(null)).toBeNull();
    expect(normalizeQueuedTransaction(undefined)).toBeNull();
    expect(normalizeQueuedTransaction({ foo: 'bar' })).toBeNull();
    expect(normalizeQueuedTransaction({ roomId: 'room-1', transaction: null })).toBeNull();
  });
});
