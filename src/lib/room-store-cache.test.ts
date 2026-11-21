import { CalendarDate } from '@internationalized/date';
import { collection, getDocs } from 'firebase/firestore';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RoomUserRole } from '@/constants/room-roles';
import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { SyncedListenerType, transactionRepository } from '@/lib/transaction-repository';
import { getUserRooms } from '@/services/firebase/getUserRooms';
import { useRoomStore } from '@/store/roomStore';
import { OutboxOperation } from '@/types/outbox';
import { RoomType } from '@/types/room';
import { SyncStatus, TransactionProps } from '@/types/transaction';

const { syncedListeners } = vi.hoisted(() => ({
  syncedListeners: [] as SyncedListenerType[],
}));

vi.mock('@/services/firebase/config', () => ({
  db: {},
  auth: {},
}));

vi.mock('@/lib/transaction-repository', () => ({
  transactionRepository: {
    enqueueCreate: vi.fn().mockResolvedValue(undefined),
    enqueueUpdate: vi.fn().mockResolvedValue(undefined),
    enqueueDelete: vi.fn().mockResolvedValue(undefined),
    hydrateRoomTransactions: vi.fn(async (_roomId: string, base: TransactionProps[]) => base),
    requestFlush: vi.fn().mockResolvedValue([]),
    subscribeSynced: vi.fn((listener: SyncedListenerType) => {
      syncedListeners.push(listener);
      return () => undefined;
    }),
  },
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
}));

vi.mock('@/services/firebase/getUserRooms', () => ({
  getUserRooms: vi.fn(),
}));

const mockedGetUserRooms = vi.mocked(getUserRooms);
const mockedGetDocs = vi.mocked(getDocs);
const mockedCollection = vi.mocked(collection);
const mockedRepository = vi.mocked(transactionRepository);

const createRoomFixture = (overrides: Partial<RoomType> = {}): RoomType => ({
  roomId: 'room-1',
  name: 'Дом',
  description: 'Бюджет семьи',
  categories: [],
  members: {
    'user-1': { role: RoomUserRole.ADMIN, joineredAt: new Date('2026-01-01') },
  },
  transactions: [],
  ...overrides,
});

const MOCK_TX = {
  transactionId: 'tx-100',
  roomId: 'room-1',
  userId: 'user-1',
  type: TRANSACTION_TYPE.EXPENSE,
  amount: 1200,
  description: 'Продукты',
} as TransactionProps;

describe('useRoomStore — кэширование комнат и делегирование в transactionRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedRepository.hydrateRoomTransactions.mockImplementation(async (_roomId, base) => base);
    useRoomStore.getState().resetUserRooms();
  });

  it('должен кэшировать комнаты пользователя и не вызывать getUserRooms повторно без force', async () => {
    const rooms = [createRoomFixture()];
    mockedGetUserRooms.mockResolvedValueOnce(rooms);

    const firstResult = await useRoomStore.getState().fetchUserRooms('user-1');
    const secondResult = await useRoomStore.getState().fetchUserRooms('user-1');

    expect(mockedGetUserRooms).toHaveBeenCalledTimes(1);
    expect(firstResult).toEqual(rooms);
    expect(secondResult).toEqual(rooms);
    expect(useRoomStore.getState().hasLoadedUserRooms).toBe(true);
  });

  it('должен дедуплицировать параллельные вызовы fetchUserRooms для одного пользователя', async () => {
    let resolveRooms!: (value: RoomType[]) => void;
    mockedGetUserRooms.mockImplementationOnce(
      () =>
        new Promise<RoomType[]>((resolve) => {
          resolveRooms = resolve;
        })
    );

    const p1 = useRoomStore.getState().fetchUserRooms('user-1');
    const p2 = useRoomStore.getState().fetchUserRooms('user-1');

    resolveRooms([createRoomFixture()]);

    const [res1, res2] = await Promise.all([p1, p2]);

    expect(mockedGetUserRooms).toHaveBeenCalledTimes(1);
    expect(res1).toEqual(res2);
  });

  it('должен сохранять уже загруженные транзакции активной комнаты при fetchUserRooms({ force: true }) и setRoom', async () => {
    const roomWithLoadedTx = createRoomFixture({ transactions: [MOCK_TX] });
    useRoomStore.getState().setRoom(roomWithLoadedTx);

    mockedGetUserRooms.mockResolvedValueOnce([
      createRoomFixture({ name: 'Дом (обновлено)', transactions: [] }),
    ]);

    await useRoomStore.getState().fetchUserRooms('user-1', { force: true });

    const stateAfterFetch = useRoomStore.getState();
    expect(stateAfterFetch.room?.name).toBe('Дом (обновлено)');
    expect(stateAfterFetch.room?.transactions).toEqual([MOCK_TX]);

    useRoomStore
      .getState()
      .setRoom(createRoomFixture({ name: 'Дом (повторный setRoom)', transactions: [] }));

    expect(useRoomStore.getState().room?.transactions).toEqual([MOCK_TX]);
  });

  it('должен отличать метаданные комнаты без подколлекции от реально загруженных транзакций через loadedTransactionsRoomId', async () => {
    useRoomStore.getState().setRoom(createRoomFixture({ roomId: 'room-1', transactions: [] }));
    expect(useRoomStore.getState().loadedTransactionsRoomId).toBeNull();

    mockedCollection.mockReturnValue({} as ReturnType<typeof collection>);
    mockedGetDocs.mockResolvedValueOnce({
      docs: [{ id: MOCK_TX.transactionId, data: () => MOCK_TX }],
    } as unknown as Awaited<ReturnType<typeof getDocs>>);

    await useRoomStore.getState().fetchTransactions('room-1');

    expect(useRoomStore.getState().loadedTransactionsRoomId).toBe('room-1');
    expect(useRoomStore.getState().room?.transactions).toHaveLength(1);

    useRoomStore.getState().setRoom(createRoomFixture({ roomId: 'room-2' }));
    expect(useRoomStore.getState().loadedTransactionsRoomId).toBeNull();
  });

  it('не должен помечать hasLoadedUserRooms = true при ошибке сети и должен позволять повторный запрос', async () => {
    mockedGetUserRooms.mockRejectedValueOnce(new Error('Network error'));

    await expect(useRoomStore.getState().fetchUserRooms('user-1')).rejects.toThrow('Network error');
    expect(useRoomStore.getState().hasLoadedUserRooms).toBe(false);
    expect(useRoomStore.getState().isUserRoomsLoading).toBe(false);

    mockedGetUserRooms.mockResolvedValueOnce([createRoomFixture()]);
    const recovered = await useRoomStore.getState().fetchUserRooms('user-1');

    expect(recovered).toHaveLength(1);
    expect(useRoomStore.getState().hasLoadedUserRooms).toBe(true);
  });

  it('должен полностью очищать кэш комнат и loadedTransactionsRoomId при resetUserRooms', async () => {
    mockedGetUserRooms.mockResolvedValueOnce([createRoomFixture()]);
    await useRoomStore.getState().fetchUserRooms('user-1');
    useRoomStore.getState().setRoom(createRoomFixture({ transactions: [MOCK_TX] }));

    useRoomStore.getState().resetUserRooms();

    const state = useRoomStore.getState();
    expect(state.room).toBeNull();
    expect(state.userRooms).toEqual([]);
    expect(state.hasLoadedUserRooms).toBe(false);
    expect(state.loadedRoomsUserId).toBeNull();
    expect(state.loadedTransactionsRoomId).toBeNull();
    expect(state.loadedMembersRoomId).toBeNull();
  });

  it('должен оптимистично создавать, обновлять и удалять транзакцию через transactionRepository и переключать статус по событию subscribeSynced', async () => {
    const baseRoom = createRoomFixture({ roomId: 'room-1', transactions: [] });
    mockedGetUserRooms.mockResolvedValueOnce([baseRoom]);
    await useRoomStore.getState().fetchUserRooms('user-1');
    useRoomStore.getState().setRoom(baseRoom);

    await useRoomStore.getState().addTransaction('room-1', {
      roomId: 'room-1',
      userId: 'user-1',
      type: TRANSACTION_TYPE.EXPENSE,
      amount: 500,
      description: 'Такси',
      date: { seconds: 1_700_000_000, nanoseconds: 0 } as unknown as TransactionProps['date'],
      category: {
        id: 'cat-1',
        name: 'Транспорт',
        color: '#3b82f6',
        type: TRANSACTION_TYPE.EXPENSE,
      },
    });

    const createdTx = useRoomStore.getState().room?.transactions?.[0];
    expect(createdTx?.syncStatus).toBe(SyncStatus.PENDING);
    expect(mockedRepository.enqueueCreate).toHaveBeenCalledTimes(1);

    await useRoomStore.getState().updateTransaction({
      ...(createdTx as TransactionProps),
      amount: 750,
    });

    expect(useRoomStore.getState().room?.transactions?.[0]?.amount).toBe(750);
    expect(useRoomStore.getState().room?.transactions?.[0]?.syncStatus).toBe(SyncStatus.PENDING);
    expect(mockedRepository.enqueueUpdate).toHaveBeenCalledTimes(1);

    // Имитируем уведомление от Outbox Flusher о завершении синхронизации
    syncedListeners.forEach((listener) =>
      listener({
        transactionId: createdTx!.transactionId,
        roomId: 'room-1',
        op: OutboxOperation.CREATE,
        updatedAt: Date.now(),
      })
    );

    expect(useRoomStore.getState().room?.transactions?.[0]?.syncStatus).toBe(SyncStatus.SYNCED);
    expect(useRoomStore.getState().userRooms[0]?.transactions?.[0]?.syncStatus).toBe(
      SyncStatus.SYNCED
    );

    await useRoomStore.getState().deleteTransaction(createdTx!.transactionId);

    expect(useRoomStore.getState().room?.transactions).toHaveLength(0);
    expect(useRoomStore.getState().userRooms[0]?.transactions).toHaveLength(0);
    expect(mockedRepository.enqueueDelete).toHaveBeenCalledWith('room-1', createdTx!.transactionId);
  });

  it('должен корректно фильтровать оффлайн-транзакции с сериализованной датой в getFilteredTransactions', () => {
    const serializedDateTx: TransactionProps = {
      ...MOCK_TX,
      transactionId: 'tx-offline-date',
      type: TRANSACTION_TYPE.EXPENSE,
      date: {
        seconds: Math.floor(new Date('2026-05-15T10:00:00.000Z').getTime() / 1000),
        nanoseconds: 0,
      } as unknown as TransactionProps['date'],
    };

    useRoomStore
      .getState()
      .setRoom(createRoomFixture({ roomId: 'room-1', transactions: [serializedDateTx] }));

    const filtered = useRoomStore.getState().getFilteredTransactions(TRANSACTION_TYPE.EXPENSE, {
      start: new CalendarDate(2026, 5, 1),
      end: new CalendarDate(2026, 5, 31),
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.transactionId).toBe('tx-offline-date');
  });
});
