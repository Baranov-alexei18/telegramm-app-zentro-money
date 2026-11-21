import { Timestamp } from 'firebase/firestore';
import { describe, expect, it } from 'vitest';

import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { SyncStatus, TransactionProps } from '@/types/transaction';

import {
  normalizeLegacyTransactionRecord,
  normalizeTransactionTimestamps,
  restoreTimestamp,
} from './restore-timestamp';

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
  });

  it('должен конвертировать валидный Date, строку и число миллисекунд в Timestamp', () => {
    const ms = new Date('2026-05-10T12:00:00.000Z').getTime();
    const fromDate = restoreTimestamp(new Date(ms));
    const fromString = restoreTimestamp('2026-05-10T12:00:00.000Z');
    const fromNumber = restoreTimestamp(ms);

    expect(fromDate).toBeInstanceOf(Timestamp);
    expect(fromString).toBeInstanceOf(Timestamp);
    expect(fromNumber).toBeInstanceOf(Timestamp);
    expect(fromDate?.toMillis()).toBe(ms);
    expect(fromString?.toMillis()).toBe(ms);
    expect(fromNumber?.toMillis()).toBe(ms);
  });

  it('должен возвращать undefined для пустых и невалидных значений', () => {
    expect(restoreTimestamp(null)).toBeUndefined();
    expect(restoreTimestamp(undefined)).toBeUndefined();
    expect(restoreTimestamp('invalid-date')).toBeUndefined();
    expect(restoreTimestamp(new Date('invalid'))).toBeUndefined();
  });
});

describe('normalizeTransactionTimestamps и normalizeLegacyTransactionRecord', () => {
  it('должен восстанавливать поля date и createdAt у транзакции', () => {
    const raw = {
      ...createMockTransaction(),
      date: { seconds: 1_700_000_000, nanoseconds: 0 } as unknown as Timestamp,
      createdAt: { seconds: 1_700_000_100, nanoseconds: 0 } as unknown as Timestamp,
    };

    const normalized = normalizeTransactionTimestamps(raw);

    expect(normalized.date).toBeInstanceOf(Timestamp);
    expect(normalized.createdAt).toBeInstanceOf(Timestamp);
  });

  it('должен корректно нормализовать старые записи v1 (напрямую и в обёртке { roomId, transaction })', () => {
    const directTx = createMockTransaction({ syncStatus: undefined });
    const legacyWrapped = {
      roomId: 'room-legacy',
      transaction: { ...createMockTransaction({ roomId: '' }), date: { seconds: 1_700_000_000 } },
    };

    const resDirect = normalizeLegacyTransactionRecord(directTx);
    const resWrapped = normalizeLegacyTransactionRecord(legacyWrapped);

    expect(resDirect?.syncStatus).toBe(SyncStatus.PENDING);
    expect(resWrapped?.roomId).toBe('room-legacy');
    expect(resWrapped?.date).toBeInstanceOf(Timestamp);
  });

  it('должен возвращать null для невалидных legacy-записей', () => {
    expect(normalizeLegacyTransactionRecord(null)).toBeNull();
    expect(normalizeLegacyTransactionRecord({ foo: 'bar' })).toBeNull();
    expect(normalizeLegacyTransactionRecord({ transactionId: 'tx-1', roomId: '' })).toBeNull();
  });
});
