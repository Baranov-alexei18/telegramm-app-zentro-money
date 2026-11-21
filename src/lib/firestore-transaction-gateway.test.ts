import { Timestamp } from 'firebase/firestore';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { createTransaction } from '@/services/firebase/createTransaction';
import { deleteTransactionById } from '@/services/firebase/deleteTransactionById';
import { updateTransaction } from '@/services/firebase/updateTransaction';
import { SyncStatus, TransactionProps } from '@/types/transaction';

import { createFirestoreTransactionGateway } from './firestore-transaction-gateway';

vi.mock('@/services/firebase/createTransaction', () => ({
  createTransaction: vi.fn(),
}));

vi.mock('@/services/firebase/updateTransaction', () => ({
  updateTransaction: vi.fn(),
}));

vi.mock('@/services/firebase/deleteTransactionById', () => ({
  deleteTransactionById: vi.fn(),
}));

const mockedCreate = vi.mocked(createTransaction);
const mockedUpdate = vi.mocked(updateTransaction);
const mockedDelete = vi.mocked(deleteTransactionById);

const createSampleTx = (overrides: Partial<TransactionProps> = {}): TransactionProps => ({
  transactionId: 'tx-1',
  roomId: 'room-1',
  userId: 'user-1',
  type: TRANSACTION_TYPE.EXPENSE,
  amount: 420,
  description: 'Кофе',
  syncStatus: SyncStatus.PENDING,
  date: { seconds: 1_700_000_000, nanoseconds: 0 } as unknown as Timestamp,
  category: { id: 'cat-1', name: 'Еда', color: '#ef4444', type: TRANSACTION_TYPE.EXPENSE },
  ...overrides,
});

describe('createFirestoreTransactionGateway', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен очищать syncStatus и восстанавливать Timestamp перед вызовом createTransaction и updateTransaction', async () => {
    const gateway = createFirestoreTransactionGateway();
    const tx = createSampleTx();

    mockedCreate.mockResolvedValueOnce('tx-1');
    mockedUpdate.mockResolvedValueOnce(undefined);

    await gateway.create('room-1', tx);
    await gateway.update('room-1', tx);

    const createPayload = mockedCreate.mock.calls[0]?.[2];
    const updatePayload = mockedUpdate.mock.calls[0]?.[2] as TransactionProps;

    expect('syncStatus' in (createPayload ?? {})).toBe(false);
    expect(createPayload?.date).toBeInstanceOf(Timestamp);
    expect('syncStatus' in updatePayload).toBe(false);
    expect(updatePayload.date).toBeInstanceOf(Timestamp);
  });

  it('должен делегировать удаление в deleteTransactionById', async () => {
    const gateway = createFirestoreTransactionGateway();
    mockedDelete.mockResolvedValueOnce(undefined);

    await gateway.remove('room-1', 'tx-99');

    expect(mockedDelete).toHaveBeenCalledWith('room-1', 'tx-99');
  });
});
