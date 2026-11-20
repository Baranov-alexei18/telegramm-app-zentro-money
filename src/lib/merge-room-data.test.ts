import { describe, expect, it } from 'vitest';

import { RoomUserRole } from '@/constants/room-roles';
import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { RoomType } from '@/types/room';
import { TransactionProps } from '@/types/transaction';

import { mergeRoomPreservingTransactions, syncRoomInList } from './merge-room-data';

const createMockRoom = (overrides: Partial<RoomType> = {}): RoomType => ({
  roomId: 'room-1',
  name: 'Семейный бюджет',
  description: 'Общие расходы',
  categories: [],
  members: {
    'user-1': { role: RoomUserRole.ADMIN, joineredAt: new Date('2026-01-01') },
  },
  transactions: [],
  ...overrides,
});

const MOCK_TRANSACTION = {
  transactionId: 'tx-1',
  roomId: 'room-1',
  userId: 'user-1',
  type: TRANSACTION_TYPE.EXPENSE,
  amount: 500,
  description: 'Кофе',
} as TransactionProps;

describe('mergeRoomPreservingTransactions', () => {
  it('должен возвращать null, если новая комната равна null', () => {
    const current = createMockRoom({ transactions: [MOCK_TRANSACTION] });
    expect(mergeRoomPreservingTransactions(current, null)).toBeNull();
  });

  it('должен сохранять уже загруженные транзакции, если в обновлённой комнате пустой массив transactions', () => {
    const current = createMockRoom({ transactions: [MOCK_TRANSACTION] });
    const incoming = createMockRoom({ name: 'Обновлённое имя', transactions: [] });

    const merged = mergeRoomPreservingTransactions(current, incoming);

    expect(merged?.name).toBe('Обновлённое имя');
    expect(merged?.transactions).toEqual([MOCK_TRANSACTION]);
  });

  it('не должен переносить транзакции от другой комнаты с другим roomId', () => {
    const current = createMockRoom({ roomId: 'room-1', transactions: [MOCK_TRANSACTION] });
    const incoming = createMockRoom({ roomId: 'room-2', name: 'Отпуск', transactions: [] });

    const merged = mergeRoomPreservingTransactions(current, incoming);

    expect(merged?.roomId).toBe('room-2');
    expect(merged?.transactions).toEqual([]);
  });
});

describe('syncRoomInList', () => {
  it('должен обновлять комнату в списке, сохраняя её транзакции и не затрагивая остальные комнаты', () => {
    const room1 = createMockRoom({ roomId: 'room-1', transactions: [MOCK_TRANSACTION] });
    const room2 = createMockRoom({ roomId: 'room-2', name: 'Дом' });
    const updatedRoom1 = createMockRoom({
      roomId: 'room-1',
      name: 'Семейный бюджет 2.0',
      transactions: [],
    });

    const result = syncRoomInList([room1, room2], updatedRoom1);

    expect(result[0].name).toBe('Семейный бюджет 2.0');
    expect(result[0].transactions).toEqual([MOCK_TRANSACTION]);
    expect(result[1]).toEqual(room2);
  });
});
