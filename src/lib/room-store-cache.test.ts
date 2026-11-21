import { CalendarDate } from '@internationalized/date';
import { collection, getDocs } from 'firebase/firestore';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RoomUserRole } from '@/constants/room-roles';
import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import {
  getQueuedTransactions,
  queueTransaction,
  removeQueuedTransaction,
} from '@/lib/transaction-queue';
import { createTransaction } from '@/services/firebase/createTransaction';
import { getUserRooms } from '@/services/firebase/getUserRooms';
import { updateTransaction } from '@/services/firebase/updateTransaction';
import { useRoomStore } from '@/store/roomStore';
import { RoomType } from '@/types/room';
import { SyncStatus, TransactionProps } from '@/types/transaction';

vi.mock('@/services/firebase/config', () => ({
  db: {},
  auth: {},
}));

vi.mock('@/lib/transaction-queue', () => ({
  getQueuedTransactions: vi.fn().mockResolvedValue([]),
  queueTransaction: vi.fn().mockResolvedValue(undefined),
  removeQueuedTransaction: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/services/firebase/createTransaction', () => ({
  createTransaction: vi.fn(),
}));

vi.mock('@/services/firebase/updateTransaction', () => ({
  updateTransaction: vi.fn(),
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
const mockedCreateTransaction = vi.mocked(createTransaction);
const mockedUpdateTransaction = vi.mocked(updateTransaction);
const mockedQueueTransaction = vi.mocked(queueTransaction);
const mockedGetQueuedTransactions = vi.mocked(getQueuedTransactions);
const mockedRemoveQueuedTransaction = vi.mocked(removeQueuedTransaction);

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

describe('useRoomStore — кэширование комнат и сохранение транзакций', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('должен мгновенно завершать addTransaction без ожидания ответа Firestore и ставить транзакцию в очередь', async () => {
    const baseRoom = createRoomFixture({ roomId: 'room-1', transactions: [] });
    mockedGetUserRooms.mockResolvedValueOnce([baseRoom]);
    await useRoomStore.getState().fetchUserRooms('user-1');
    useRoomStore.getState().setRoom(baseRoom);

    // Имитируем зависший промис Firestore (как при persistentLocalCache без сети)
    mockedCreateTransaction.mockImplementationOnce(() => new Promise(() => undefined));

    const newTxInput = {
      roomId: 'room-1',
      userId: 'user-1',
      type: TRANSACTION_TYPE.EXPENSE,
      amount: 990,
      description: 'Такси',
      date: { seconds: 1_700_000_000, nanoseconds: 0 } as unknown as TransactionProps['date'],
      category: {
        id: 'cat-1',
        name: 'Транспорт',
        color: '#3b82f6',
        type: TRANSACTION_TYPE.EXPENSE,
      },
    };

    await useRoomStore.getState().addTransaction('room-1', newTxInput);

    const state = useRoomStore.getState();
    expect(mockedQueueTransaction).toHaveBeenCalledTimes(1);
    expect(state.room?.transactions).toHaveLength(1);
    expect(state.room?.transactions?.[0]?.syncStatus).toBe(SyncStatus.PENDING);
    expect(state.userRooms[0]?.transactions).toHaveLength(1);
    expect(state.userRooms[0]?.transactions?.[0]?.syncStatus).toBe(SyncStatus.PENDING);
  });

  it('должен переводить статус транзакции в SYNCED в room и userRooms через markTransactionsSynced', async () => {
    const pendingTx: TransactionProps = {
      ...MOCK_TX,
      transactionId: 'tx-pending-1',
      syncStatus: SyncStatus.PENDING,
    };
    const roomWithPending = createRoomFixture({ roomId: 'room-1', transactions: [pendingTx] });

    mockedGetUserRooms.mockResolvedValueOnce([roomWithPending]);
    await useRoomStore.getState().fetchUserRooms('user-1');
    useRoomStore.getState().setRoom(roomWithPending);

    useRoomStore.getState().markTransactionsSynced(['tx-pending-1']);

    const state = useRoomStore.getState();
    expect(state.room?.transactions?.[0]?.syncStatus).toBe(SyncStatus.SYNCED);
    expect(state.userRooms[0]?.transactions?.[0]?.syncStatus).toBe(SyncStatus.SYNCED);
  });

  it('не должен удалять PENDING-транзакцию из IndexedDB при вызове hydrateTransactionsFromQueue', async () => {
    const pendingTx: TransactionProps = {
      ...MOCK_TX,
      transactionId: 'tx-still-pending',
      roomId: 'room-1',
      syncStatus: SyncStatus.PENDING,
    };

    useRoomStore
      .getState()
      .setRoom(createRoomFixture({ roomId: 'room-1', transactions: [pendingTx] }));
    mockedGetQueuedTransactions.mockResolvedValueOnce([pendingTx]);

    await useRoomStore.getState().hydrateTransactionsFromQueue();

    expect(mockedRemoveQueuedTransaction).not.toHaveBeenCalled();
    expect(useRoomStore.getState().room?.transactions).toHaveLength(1);
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

  it('должен мгновенно обновлять PENDING-транзакцию в оффлайне в сторе и IndexedDB без обращения к Firestore', async () => {
    vi.stubGlobal('navigator', { onLine: false });

    const pendingTx: TransactionProps = {
      ...MOCK_TX,
      transactionId: 'tx-edit-offline',
      roomId: 'room-1',
      amount: 500,
      description: 'Кофе',
      syncStatus: SyncStatus.PENDING,
      date: { seconds: 1_700_000_000, nanoseconds: 0 } as unknown as TransactionProps['date'],
      category: { id: 'cat-1', name: 'Еда', color: '#ef4444', type: TRANSACTION_TYPE.EXPENSE },
    };

    const roomWithPending = createRoomFixture({ roomId: 'room-1', transactions: [pendingTx] });
    mockedGetUserRooms.mockResolvedValueOnce([roomWithPending]);
    await useRoomStore.getState().fetchUserRooms('user-1');
    useRoomStore.getState().setRoom(roomWithPending);

    const updatedTx: TransactionProps = {
      ...pendingTx,
      amount: 850,
      description: 'Кофе и десерт',
    };

    await useRoomStore.getState().updateTransaction(updatedTx);

    const state = useRoomStore.getState();
    expect(mockedUpdateTransaction).not.toHaveBeenCalled();
    expect(mockedCreateTransaction).not.toHaveBeenCalled();
    expect(mockedQueueTransaction).toHaveBeenCalledWith({
      roomId: 'room-1',
      transaction: expect.objectContaining({
        transactionId: 'tx-edit-offline',
        amount: 850,
        description: 'Кофе и десерт',
        syncStatus: SyncStatus.PENDING,
      }),
    });
    expect(state.room?.transactions?.[0]?.amount).toBe(850);
    expect(state.room?.transactions?.[0]?.description).toBe('Кофе и десерт');
    expect(state.room?.transactions?.[0]?.syncStatus).toBe(SyncStatus.PENDING);
    expect(state.userRooms[0]?.transactions?.[0]?.amount).toBe(850);

    vi.unstubAllGlobals();
  });

  it('должен вызывать сервис updateTransaction для уже синхронизированной транзакции', async () => {
    const syncedTx: TransactionProps = {
      ...MOCK_TX,
      transactionId: 'tx-synced-1',
      roomId: 'room-1',
      amount: 1200,
      syncStatus: SyncStatus.SYNCED,
    };

    const roomWithSynced = createRoomFixture({ roomId: 'room-1', transactions: [syncedTx] });
    mockedGetUserRooms.mockResolvedValueOnce([roomWithSynced]);
    await useRoomStore.getState().fetchUserRooms('user-1');
    useRoomStore.getState().setRoom(roomWithSynced);
    mockedUpdateTransaction.mockResolvedValueOnce(undefined);

    await useRoomStore.getState().updateTransaction({
      ...syncedTx,
      amount: 1500,
    });

    expect(mockedUpdateTransaction).toHaveBeenCalledTimes(1);
    expect(mockedQueueTransaction).not.toHaveBeenCalled();
    expect(useRoomStore.getState().room?.transactions?.[0]?.amount).toBe(1500);
    expect(useRoomStore.getState().userRooms[0]?.transactions?.[0]?.amount).toBe(1500);
  });
});
