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

import { normalizeQueuedTransaction, restoreTimestamp } from './transaction-queue';

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

describe('restoreTimestamp', () => {
  it('должен возвращать экземпляр Timestamp без изменений', () => {
    const ts = Timestamp.fromMillis(1_700_000_000_000);

    expect(restoreTimestamp(ts)).toBe(ts);
  });

  it('должен восстанавливать Timestamp из десериализованного объекта { seconds, nanoseconds }', () => {
    const restored = restoreTimestamp({ seconds: 1_700_000_000, nanoseconds: 500_000_000 });

    expect(restored).toBeInstanceOf(Timestamp);
    expect(restored?.seconds).toBe(1_700_000_000);
    expect(restored?.nanoseconds).toBe(500_000_000);
    expect(typeof restored?.toDate).toBe('function');
  });

  it('должен конвертировать валидный Date и ISO-строку в Timestamp', () => {
    const fromDate = restoreTimestamp(new Date('2026-05-10T12:00:00.000Z'));
    const fromString = restoreTimestamp('2026-05-10T12:00:00.000Z');

    expect(fromDate).toBeInstanceOf(Timestamp);
    expect(fromString).toBeInstanceOf(Timestamp);
    expect(fromDate?.toMillis()).toBe(fromString?.toMillis());
  });

  it('должен возвращать undefined для пустых и невалидных значений', () => {
    expect(restoreTimestamp(null)).toBeUndefined();
    expect(restoreTimestamp(undefined)).toBeUndefined();
    expect(restoreTimestamp('not-a-date')).toBeUndefined();
    expect(restoreTimestamp(new Date('invalid'))).toBeUndefined();
  });
});

describe('normalizeQueuedTransaction', () => {
  it('должен возвращать транзакцию, если запись сохранена напрямую как TransactionProps', () => {
    const tx = createMockTransaction();

    expect(normalizeQueuedTransaction(tx)).toEqual(tx);
  });

  it('должен восстанавливать прототип Timestamp для поля date после чтения из IndexedDB и ставить статус PENDING', () => {
    const serializedRecord = {
      ...createMockTransaction({ syncStatus: undefined }),
      date: { seconds: 1_700_000_000, nanoseconds: 0 },
      createdAt: { seconds: 1_700_000_100, nanoseconds: 0 },
    };

    const normalized = normalizeQueuedTransaction(serializedRecord);

    expect(normalized).not.toBeNull();
    expect(normalized?.date).toBeInstanceOf(Timestamp);
    expect(normalized?.createdAt).toBeInstanceOf(Timestamp);
    expect(normalized?.date.toDate().getTime()).toBe(1_700_000_000_000);
    expect(normalized?.syncStatus).toBe(SyncStatus.PENDING);
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
