import { Timestamp } from 'firebase/firestore';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { createTransaction } from '@/services/firebase/createTransaction';
import { SyncStatus, TransactionProps } from '@/types/transaction';

import { syncQueuedTransactions } from './sync-transactions';
import { getQueuedTransactions, removeQueuedTransaction } from './transaction-queue';

vi.mock('@/services/firebase/createTransaction', () => ({
  createTransaction: vi.fn(),
}));

vi.mock('./transaction-queue', () => ({
  getQueuedTransactions: vi.fn(),
  removeQueuedTransaction: vi.fn(),
}));

const mockedCreateTransaction = vi.mocked(createTransaction);
const mockedGetQueuedTransactions = vi.mocked(getQueuedTransactions);
const mockedRemoveQueuedTransaction = vi.mocked(removeQueuedTransaction);

const createQueuedTx = (overrides: Partial<TransactionProps> = {}): TransactionProps => ({
  transactionId: 'tx-1',
  roomId: 'room-1',
  userId: 'user-1',
  type: TRANSACTION_TYPE.EXPENSE,
  amount: 350,
  description: 'Обед',
  date: Timestamp.fromMillis(1_700_000_000_000),
  syncStatus: SyncStatus.PENDING,
  category: {
    id: 'cat-food',
    name: 'Еда',
    color: '#ef4444',
    type: TRANSACTION_TYPE.EXPENSE,
  },
  ...overrides,
});

describe('syncQueuedTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен отправлять транзакции из очереди, удалять их из IndexedDB и вызывать onTransactionSynced', async () => {
    const tx1 = createQueuedTx({ transactionId: 'tx-1', roomId: 'room-1' });
    const tx2 = createQueuedTx({ transactionId: 'tx-2', roomId: 'room-2' });
    const onTransactionSynced = vi.fn();

    mockedGetQueuedTransactions.mockResolvedValueOnce([tx1, tx2]);
    mockedCreateTransaction.mockResolvedValue('ok');
    mockedRemoveQueuedTransaction.mockResolvedValue(undefined);

    const syncedIds = await syncQueuedTransactions({ onTransactionSynced });

    expect(syncedIds).toEqual(['tx-1', 'tx-2']);
    expect(mockedCreateTransaction).toHaveBeenCalledTimes(2);
    expect(mockedRemoveQueuedTransaction).toHaveBeenCalledWith('tx-1');
    expect(mockedRemoveQueuedTransaction).toHaveBeenCalledWith('tx-2');
    expect(onTransactionSynced).toHaveBeenNthCalledWith(1, 'tx-1');
    expect(onTransactionSynced).toHaveBeenNthCalledWith(2, 'tx-2');
  });

  it('должен исключать клиентское поле syncStatus из payload перед вызовом createTransaction', async () => {
    const tx = createQueuedTx({ transactionId: 'tx-clean', syncStatus: SyncStatus.PENDING });

    mockedGetQueuedTransactions.mockResolvedValueOnce([tx]);
    mockedCreateTransaction.mockResolvedValueOnce('tx-clean');

    await syncQueuedTransactions();

    const passedPayload = mockedCreateTransaction.mock.calls[0]?.[2];
    expect(passedPayload).toBeDefined();
    expect('syncStatus' in (passedPayload ?? {})).toBe(false);
  });

  it('должен пропускать записи без roomId или transactionId', async () => {
    const invalidRoomTx = createQueuedTx({ roomId: '' });
    const invalidIdTx = createQueuedTx({ transactionId: '' });

    mockedGetQueuedTransactions.mockResolvedValueOnce([invalidRoomTx, invalidIdTx]);

    const syncedIds = await syncQueuedTransactions();

    expect(syncedIds).toEqual([]);
    expect(mockedCreateTransaction).not.toHaveBeenCalled();
    expect(mockedRemoveQueuedTransaction).not.toHaveBeenCalled();
  });

  it('должен продолжать синхронизацию остальных записей при ошибке отправки одной транзакции', async () => {
    const failingTx = createQueuedTx({ transactionId: 'tx-fail' });
    const succeedingTx = createQueuedTx({ transactionId: 'tx-ok' });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    mockedGetQueuedTransactions.mockResolvedValueOnce([failingTx, succeedingTx]);
    mockedCreateTransaction
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce('tx-ok');

    const syncedIds = await syncQueuedTransactions();

    expect(syncedIds).toEqual(['tx-ok']);
    expect(mockedRemoveQueuedTransaction).not.toHaveBeenCalledWith('tx-fail');
    expect(mockedRemoveQueuedTransaction).toHaveBeenCalledWith('tx-ok');

    consoleErrorSpy.mockRestore();
  });
});
