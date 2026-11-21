import { CalendarDate } from '@internationalized/date';
import { collection, getDocs } from 'firebase/firestore';
import { create } from 'zustand';

import { notificationManager } from '@/components/shared/toast/utils';
import { COLLECTION_ROOM, SUB_COLLECTION_TRANSACTIONS } from '@/constants/db';
import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { mergeRoomPreservingTransactions, syncRoomInList } from '@/lib/merge-room-data';
import {
  getQueuedTransactions,
  queueTransaction,
  removeQueuedTransaction,
} from '@/lib/transaction-queue';
import { db } from '@/services/firebase/config';
import { createCategory } from '@/services/firebase/createCategory';
import { createTransaction } from '@/services/firebase/createTransaction';
import { deleteCategoryById } from '@/services/firebase/deleteCategoryById';
import { deleteTransactionById } from '@/services/firebase/deleteTransactionById';
import { deleteUserFromRoom } from '@/services/firebase/deleteUserFromRoom';
import { getRoomUsers } from '@/services/firebase/getRoomUsers';
import { getUserRooms } from '@/services/firebase/getUserRooms';
import { joinUserToRoom } from '@/services/firebase/joinUserToRoom';
import { removeNotificationRoom } from '@/services/firebase/removeNotificationRoom';
import { updateCategory } from '@/services/firebase/updateCategory';
import { updateTransaction } from '@/services/firebase/updateTransaction';
import { CategoryType } from '@/types/category';
import { RoomType } from '@/types/room';
import { SyncStatus, TransactionProps } from '@/types/transaction';
import { UserWithRoleRoom } from '@/types/user';

type FetchUserRoomsOptions = {
  force?: boolean;
  silent?: boolean;
};

type RoomStoreState = {
  room: RoomType | null;
  loadedTransactionsRoomId: string | null;
  loadedMembersRoomId: string | null;
  userRooms: RoomType[];
  isUserRoomsLoading: boolean;
  hasLoadedUserRooms: boolean;
  loadedRoomsUserId: string | null;
  members: UserWithRoleRoom[];
  isLoading: boolean;
  error: string | null;
  setRoom: (room: RoomType | null) => void;
  clearRoom: () => void;
  fetchUserRooms: (userId: string, options?: FetchUserRoomsOptions) => Promise<RoomType[]>;
  resetUserRooms: () => void;
  fetchTransactions: (roomId: string) => Promise<void>;
  fetchMembers: (room: RoomType) => Promise<void>;
  getFilteredTransactions: (
    viewType: TRANSACTION_TYPE,
    period: { start: CalendarDate; end: CalendarDate }
  ) => TransactionProps[];
  addTransaction: (
    roomId: string,
    transaction: Omit<TransactionProps, 'transactionId'>
  ) => Promise<void>;
  addCategory: (category: { name: string; type: TRANSACTION_TYPE }) => Promise<void>;
  updateCategory: (data: CategoryType) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  updateTransaction: (data: TransactionProps) => Promise<void>;
  deleteTransaction: (transactionId: string) => Promise<void>;
  addUserToRoom: (userId: string) => Promise<void>;
  removeUserFromRoom: (userId: string) => Promise<void>;
  removeNotification: (userId: string) => Promise<void>;
  hydrateTransactionsFromQueue: () => Promise<void>;
};

let inFlightRoomsRequest: { userId: string; promise: Promise<RoomType[]> } | null = null;

export const useRoomStore = create<RoomStoreState>((set, get) => ({
  room: null,
  loadedTransactionsRoomId: null,
  loadedMembersRoomId: null,
  userRooms: [],
  isUserRoomsLoading: false,
  hasLoadedUserRooms: false,
  loadedRoomsUserId: null,
  members: [],
  isLoading: false,
  error: null,

  setRoom: (incomingRoom) =>
    set((state) => {
      const mergedRoom = mergeRoomPreservingTransactions(state.room, incomingRoom);
      return {
        room: mergedRoom,
        loadedTransactionsRoomId:
          mergedRoom && state.loadedTransactionsRoomId === mergedRoom.roomId
            ? state.loadedTransactionsRoomId
            : null,
        loadedMembersRoomId:
          mergedRoom && state.loadedMembersRoomId === mergedRoom.roomId
            ? state.loadedMembersRoomId
            : null,
        userRooms: syncRoomInList(state.userRooms, mergedRoom),
      };
    }),
  clearRoom: () =>
    set({
      room: null,
      loadedTransactionsRoomId: null,
      loadedMembersRoomId: null,
      error: null,
    }),

  fetchUserRooms: async (userId, options) => {
    const { hasLoadedUserRooms, loadedRoomsUserId, userRooms } = get();

    if (!options?.force && hasLoadedUserRooms && loadedRoomsUserId === userId) {
      return userRooms;
    }

    if (!options?.force && inFlightRoomsRequest?.userId === userId) {
      return inFlightRoomsRequest.promise;
    }

    if (!options?.silent) {
      set({ isUserRoomsLoading: true });
    }

    let requestPromise: Promise<RoomType[]> | null = null;

    const executeFetch = async (): Promise<RoomType[]> => {
      try {
        const fetchedRooms = await getUserRooms(userId);
        const state = get();
        const mergedRooms = fetchedRooms.map((fetched) => {
          const cached = state.userRooms.find((item) => item.roomId === fetched.roomId) ?? null;
          const base =
            state.room?.roomId === fetched.roomId
              ? mergeRoomPreservingTransactions(state.room, fetched)
              : mergeRoomPreservingTransactions(cached, fetched);
          return base ?? fetched;
        });

        const syncedActiveRoom = state.room
          ? mergeRoomPreservingTransactions(
              state.room,
              mergedRooms.find((item) => item.roomId === state.room?.roomId) ?? state.room
            )
          : null;

        set({
          userRooms: mergedRooms,
          hasLoadedUserRooms: true,
          loadedRoomsUserId: userId,
          isUserRoomsLoading: false,
          room: syncedActiveRoom,
        });

        return mergedRooms;
      } catch (error) {
        set({ isUserRoomsLoading: false });
        throw error;
      } finally {
        if (inFlightRoomsRequest?.promise === requestPromise) {
          inFlightRoomsRequest = null;
        }
      }
    };

    requestPromise = executeFetch();
    inFlightRoomsRequest = { userId, promise: requestPromise };

    return requestPromise;
  },

  resetUserRooms: () => {
    inFlightRoomsRequest = null;
    set({
      room: null,
      loadedTransactionsRoomId: null,
      loadedMembersRoomId: null,
      userRooms: [],
      isUserRoomsLoading: false,
      hasLoadedUserRooms: false,
      loadedRoomsUserId: null,
      members: [],
      error: null,
    });
  },

  fetchTransactions: async (roomId: string) => {
    try {
      const transactionsSnap = await getDocs(
        collection(db, COLLECTION_ROOM, roomId, SUB_COLLECTION_TRANSACTIONS)
      );
      const transactions: TransactionProps[] = transactionsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as unknown as TransactionProps[];

      set((state) => {
        const nextRoom =
          state.room && state.room.roomId === roomId ? { ...state.room, transactions } : state.room;
        return {
          room: nextRoom,
          loadedTransactionsRoomId: roomId,
          userRooms: syncRoomInList(state.userRooms, nextRoom),
        };
      });
    } catch (err: any) {
      console.error('Ошибка при получении транзакций:', err);
    }
  },

  fetchMembers: async (room) => {
    try {
      const users = await getRoomUsers(room);

      set((state) => ({
        ...state,
        members: users,
        loadedMembersRoomId: room.roomId,
      }));
    } catch (e) {
      console.error('Ошибка при загрузке участников:', e);
    }
  },

  addTransaction: async (roomId, transaction) => {
    const id = crypto.randomUUID();

    const optimisticTx = {
      ...transaction,
      transactionId: id,
      syncStatus: SyncStatus.PENDING,
    };

    set((state) => ({
      room: state.room
        ? {
            ...state.room,
            transactions: [...(state.room.transactions || []), optimisticTx],
          }
        : state.room,
    }));

    await queueTransaction({
      roomId,
      transaction: optimisticTx,
    });

    try {
      await createTransaction(roomId, id, transaction);

      await removeQueuedTransaction(id);

      set((state) => ({
        room: state.room
          ? {
              ...state.room,
              transactions:
                state.room.transactions?.map((t) =>
                  t.transactionId === id ? { ...t, syncStatus: SyncStatus.SYNCED } : t
                ) || [],
            }
          : state.room,
      }));
    } catch (e) {
      console.warn('offline, queued transaction');
    }
  },

  hydrateTransactionsFromQueue: async () => {
    try {
      const queuedList = await getQueuedTransactions();

      if (!queuedList.length) {
        return;
      }

      const currentRoom = get().room;

      if (!currentRoom) {
        return;
      }

      const roomQueuedList = queuedList.filter((tx) => tx.roomId === currentRoom.roomId);

      if (!roomQueuedList.length) {
        return;
      }

      const existingIds = new Set(currentRoom.transactions?.map((t) => t.transactionId));
      const alreadySyncedIds = roomQueuedList
        .filter((tx) => existingIds.has(tx.transactionId))
        .map((tx) => tx.transactionId);

      if (alreadySyncedIds.length) {
        await Promise.allSettled(alreadySyncedIds.map((txId) => removeQueuedTransaction(txId)));
      }

      set((state) => {
        if (!state.room) return state;

        const stateExistingIds = new Set(state.room.transactions?.map((t) => t.transactionId));
        const pendingTxs = queuedList.filter(
          (tx) => tx.roomId === state.room?.roomId && !stateExistingIds.has(tx.transactionId)
        );

        if (!pendingTxs.length) {
          return state;
        }

        const nextRoom = {
          ...state.room,
          transactions: [...(state.room.transactions || []), ...pendingTxs],
        };

        return {
          room: nextRoom,
          userRooms: syncRoomInList(state.userRooms, nextRoom),
        };
      });
    } catch (error) {
      console.error('Ошибка при чтении офлайн-очереди транзакций:', error);
    }
  },

  addCategory: async (category: { name: string; type: TRANSACTION_TYPE }) => {
    const roomId = get().room?.roomId;

    if (!roomId) throw new Error('roomId не найден');

    try {
      const data = await createCategory(roomId, category);

      set((state) => {
        const nextRoom = state.room
          ? { ...state.room, categories: [...state.room.categories, data] }
          : state.room;
        return {
          room: nextRoom,
          userRooms: syncRoomInList(state.userRooms, nextRoom),
        };
      });
    } catch (err: any) {
      console.error('Ошибка при добавлении категории:', err);
    }
  },

  updateCategory: async (data: CategoryType) => {
    const { room } = get();

    const roomId = room?.roomId;

    if (!roomId) throw new Error('roomId не найден');

    try {
      const categories = await updateCategory(roomId, room.categories, data);

      set((prev) => {
        const nextRoom = prev.room ? { ...prev.room, categories } : prev.room;
        return {
          room: nextRoom,
          userRooms: syncRoomInList(prev.userRooms, nextRoom),
        };
      });
    } catch (err: any) {
      console.error('Ошибка при обновлении категории:', err);
    }
  },

  deleteCategory: async (categoryId: string) => {
    const { room } = get();

    const roomId = room?.roomId;

    if (!roomId) throw new Error('roomId не найден');

    try {
      const categories = await deleteCategoryById(roomId, room.categories, categoryId);

      set((prev) => {
        const nextRoom = prev.room ? { ...prev.room, categories } : prev.room;
        return {
          room: nextRoom,
          userRooms: syncRoomInList(prev.userRooms, nextRoom),
        };
      });
    } catch (err: any) {
      console.error('Ошибка при удалении категории:', err);
    }
  },

  getFilteredTransactions: (viewType, period) => {
    const { room } = get();

    if (!room || !period) return [];

    return (
      room.transactions?.filter((t) => {
        if (t.type !== viewType) return false;

        const date = t.date?.toDate() ? t.date.toDate() : t.createdAt;

        if (!date) return false;

        const start = period.start.toDate('UTC');
        const end = period.end.toDate('UTC');
        end.setUTCHours(23, 59, 59, 999);

        return date >= start && date <= end;
      }) || []
    );
  },

  updateTransaction: async (data: TransactionProps) => {
    const { room } = get();

    const roomId = room?.roomId;

    if (!roomId) throw new Error('roomId не найден');

    try {
      await updateTransaction(roomId, data.transactionId, data);

      set((prev) => ({
        room: prev.room
          ? {
              ...prev.room,
              transactions:
                prev.room.transactions?.map((t) =>
                  t.transactionId === data.transactionId ? data : t
                ) || [],
            }
          : prev.room,
      }));
    } catch (err: any) {
      console.error('Ошибка при обновлении категории:', err);
    }
  },

  deleteTransaction: async (transactionId: string) => {
    const { room } = get();

    const roomId = room?.roomId;

    if (!roomId) throw new Error('roomId не найден');

    try {
      await deleteTransactionById(roomId, transactionId);

      set((prev) => ({
        room: prev.room
          ? {
              ...prev.room,
              transactions: prev.room.transactions?.filter(
                (t) => t.transactionId !== transactionId
              ),
            }
          : prev.room,
      }));
    } catch (err: any) {
      console.error('Ошибка при удалении транзакции:', err);
    }
  },

  addUserToRoom: async (userId) => {
    const { room } = get();

    if (!room) throw new Error('Комната не найдена');

    if (Object.keys(room.members).length >= 5) {
      throw new Error('В комнате максимальное количество людей - 5');
    }

    try {
      const data = await joinUserToRoom(userId, room);
      const nextRoom = {
        ...room,
        members: { ...(data?.members || room.members) },
        notifications: data?.notifications,
      };

      set((state) => ({
        room: nextRoom,
        userRooms: syncRoomInList(state.userRooms, nextRoom),
      }));

      notificationManager.add(
        {
          title: 'Пользователь добавлен',
          type: 'ok',
        },
        { timeout: 1500 }
      );
    } catch (err: any) {
      notificationManager.add(
        {
          title: err.message || 'Ошибка при добавлении пользователя',
          type: 'error',
        },
        { timeout: 1500 }
      );
    }
  },

  removeUserFromRoom: async (userId) => {
    const { room } = get();

    if (!room) throw new Error('Комната не найдена');

    try {
      const data = await deleteUserFromRoom(userId, room);

      const nextRoom = {
        ...room,
        members: { ...(data?.members || room.members) },
        notifications: data?.notifications,
      };

      set((state) => ({
        room: nextRoom,
        userRooms: syncRoomInList(state.userRooms, nextRoom),
      }));

      notificationManager.add(
        {
          title: 'Пользователь удален из комнаты',
          type: 'ok',
        },
        { timeout: 1500 }
      );
    } catch (err: any) {
      notificationManager.add(
        {
          title: err.message || 'Ошибка при удалении пользователя',
          type: 'error',
        },
        { timeout: 1500 }
      );
    }
  },

  removeNotification: async (userId) => {
    const { room } = get();
    if (!room) throw new Error('Комната не найдена');

    try {
      const notifications = await removeNotificationRoom(userId, room);
      const nextRoom = { ...room, notifications };

      set((state) => ({
        room: nextRoom,
        userRooms: syncRoomInList(state.userRooms, nextRoom),
      }));
    } catch (err: any) {
      console.error('Ошибка при удалении уведомления:', err);
    }
  },
}));
