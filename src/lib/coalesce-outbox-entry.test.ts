import { Timestamp } from 'firebase/firestore';
import { describe, expect, it } from 'vitest';

import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { OutboxEntryType, OutboxOperation } from '@/types/outbox';
import { SyncStatus, TransactionProps } from '@/types/transaction';

import { applyOutboxToRoomTransactions, coalesceOutboxEntry } from './coalesce-outbox-entry';

const createTx = (overrides: Partial<TransactionProps> = {}): TransactionProps => ({
  transactionId: 'tx-1',
  roomId: 'room-1',
  userId: 'user-1',
  type: TRANSACTION_TYPE.EXPENSE,
  amount: 400,
  description: 'Завтрак',
  date: Timestamp.fromMillis(1_700_000_000_000),
  category: {
    id: 'cat-1',
    name: 'Еда',
    color: '#ef4444',
    type: TRANSACTION_TYPE.EXPENSE,
  },
  ...overrides,
});

describe('coalesceOutboxEntry', () => {
  it('должен создавать записи CREATE, UPDATE и DELETE при отсутствии предыдущей записи в Outbox', () => {
    const tx = createTx();

    const created = coalesceOutboxEntry(null, {
      op: OutboxOperation.CREATE,
      roomId: 'room-1',
      transactionId: 'tx-1',
      payload: tx,
      updatedAt: 100,
    });
    const updated = coalesceOutboxEntry(null, {
      op: OutboxOperation.UPDATE,
      roomId: 'room-1',
      transactionId: 'tx-1',
      payload: tx,
      updatedAt: 200,
    });
    const deleted = coalesceOutboxEntry(null, {
      op: OutboxOperation.DELETE,
      roomId: 'room-1',
      transactionId: 'tx-1',
      updatedAt: 300,
    });

    expect(created?.op).toBe(OutboxOperation.CREATE);
    expect(created?.payload?.syncStatus).toBe(SyncStatus.PENDING);
    expect(updated?.op).toBe(OutboxOperation.UPDATE);
    expect(deleted).toEqual({
      transactionId: 'tx-1',
      roomId: 'room-1',
      op: OutboxOperation.DELETE,
      updatedAt: 300,
    });
  });

  it('должен схлопывать CREATE + UPDATE в CREATE с обновлённым payload', () => {
    const initial = coalesceOutboxEntry(null, {
      op: OutboxOperation.CREATE,
      roomId: 'room-1',
      transactionId: 'tx-1',
      payload: createTx({ amount: 400, description: 'Старое' }),
      updatedAt: 100,
    });

    const merged = coalesceOutboxEntry(initial, {
      op: OutboxOperation.UPDATE,
      roomId: 'room-1',
      transactionId: 'tx-1',
      payload: createTx({ amount: 750, description: 'Новое' }),
      updatedAt: 200,
    });

    expect(merged?.op).toBe(OutboxOperation.CREATE);
    expect(merged?.payload?.amount).toBe(750);
    expect(merged?.payload?.description).toBe('Новое');
    expect(merged?.updatedAt).toBe(200);
  });

  it('должен возвращать null при схлопывании CREATE + DELETE (взаимное уничтожение)', () => {
    const initial = coalesceOutboxEntry(null, {
      op: OutboxOperation.CREATE,
      roomId: 'room-1',
      transactionId: 'tx-1',
      payload: createTx(),
      updatedAt: 100,
    });

    const merged = coalesceOutboxEntry(initial, {
      op: OutboxOperation.DELETE,
      roomId: 'room-1',
      transactionId: 'tx-1',
      updatedAt: 200,
    });

    expect(merged).toBeNull();
  });

  it('должен схлопывать UPDATE + UPDATE в UPDATE и UPDATE + DELETE в DELETE без payload', () => {
    const firstUpdate = coalesceOutboxEntry(null, {
      op: OutboxOperation.UPDATE,
      roomId: 'room-1',
      transactionId: 'tx-1',
      payload: createTx({ amount: 500 }),
      updatedAt: 100,
    });

    const secondUpdate = coalesceOutboxEntry(firstUpdate, {
      op: OutboxOperation.UPDATE,
      roomId: 'room-1',
      transactionId: 'tx-1',
      payload: createTx({ amount: 900 }),
      updatedAt: 200,
    });

    expect(secondUpdate?.op).toBe(OutboxOperation.UPDATE);
    expect(secondUpdate?.payload?.amount).toBe(900);

    const afterDelete = coalesceOutboxEntry(secondUpdate, {
      op: OutboxOperation.DELETE,
      roomId: 'room-1',
      transactionId: 'tx-1',
      updatedAt: 300,
    });

    expect(afterDelete).toEqual({
      transactionId: 'tx-1',
      roomId: 'room-1',
      op: OutboxOperation.DELETE,
      updatedAt: 300,
    });
    expect(afterDelete?.payload).toBeUndefined();
  });
});

describe('applyOutboxToRoomTransactions', () => {
  it('должен накладывать CREATE, UPDATE и скрывать DELETE поверх серверного списка комнаты', () => {
    const serverTxs: TransactionProps[] = [
      createTx({ transactionId: 'tx-keep', amount: 100 }),
      createTx({ transactionId: 'tx-edit', amount: 200 }),
      createTx({ transactionId: 'tx-remove', amount: 300 }),
    ];

    const outboxEntries: OutboxEntryType[] = [
      {
        transactionId: 'tx-edit',
        roomId: 'room-1',
        op: OutboxOperation.UPDATE,
        payload: createTx({ transactionId: 'tx-edit', amount: 250 }),
        updatedAt: 10,
      },
      {
        transactionId: 'tx-remove',
        roomId: 'room-1',
        op: OutboxOperation.DELETE,
        updatedAt: 20,
      },
      {
        transactionId: 'tx-new',
        roomId: 'room-1',
        op: OutboxOperation.CREATE,
        payload: createTx({ transactionId: 'tx-new', amount: 999 }),
        updatedAt: 30,
      },
    ];

    const result = applyOutboxToRoomTransactions(serverTxs, outboxEntries);

    expect(result.transactions.map((t) => t.transactionId)).toEqual([
      'tx-keep',
      'tx-edit',
      'tx-new',
    ]);
    expect(result.transactions.find((t) => t.transactionId === 'tx-edit')?.amount).toBe(250);
    expect(result.transactions.find((t) => t.transactionId === 'tx-edit')?.syncStatus).toBe(
      SyncStatus.PENDING
    );
    expect(result.transactions.find((t) => t.transactionId === 'tx-new')?.syncStatus).toBe(
      SyncStatus.PENDING
    );
  });

  it('должен помечать CREATE-запись как устаревшую (staleSyncedCreateIds), если она уже пришла с сервера', () => {
    const serverTxs: TransactionProps[] = [
      createTx({ transactionId: 'tx-already-on-server', syncStatus: SyncStatus.SYNCED }),
    ];

    const outboxEntries: OutboxEntryType[] = [
      {
        transactionId: 'tx-already-on-server',
        roomId: 'room-1',
        op: OutboxOperation.CREATE,
        payload: createTx({ transactionId: 'tx-already-on-server' }),
        updatedAt: 10,
      },
    ];

    const result = applyOutboxToRoomTransactions(serverTxs, outboxEntries);

    expect(result.staleSyncedCreateIds).toEqual(['tx-already-on-server']);
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]?.syncStatus).toBe(SyncStatus.SYNCED);
  });
});
