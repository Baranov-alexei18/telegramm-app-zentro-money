import { CalendarDate } from '@internationalized/date';
import { collection, getDocs } from 'firebase/firestore';
import { create } from 'zustand';

import { notificationManager } from '@/components/shared/toast/utils';
import { COLLECTION_ROOM, SUB_COLLECTION_TRANSACTIONS } from '@/constants/db';
import { RoomUserRole } from '@/constants/room-roles';
import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { canSwitchRoomKind, ROOM_KIND_SWITCH_BLOCKED_MESSAGE } from '@/lib/can-switch-room-kind';
import { getRoomJoinLimitError } from '@/lib/get-room-join-limit-error';
import { mergeRoomPreservingTransactions, syncRoomInList } from '@/lib/merge-room-data';
import { resolveRoomKind } from '@/lib/resolve-room-kind';
import { transactionRepository } from '@/lib/transaction-repository';
import { applyRoomAdminTransfer } from '@/lib/transfer-room-admin-members';
import { db } from '@/services/firebase/config';
import { createCategory } from '@/services/firebase/createCategory';
import { deleteCategoryById } from '@/services/firebase/deleteCategoryById';
import { deleteUserFromRoom } from '@/services/firebase/deleteUserFromRoom';
import { ensureRoomKind as persistMissingRoomKind } from '@/services/firebase/ensureRoomKind';
import { getRoomUsers } from '@/services/firebase/getRoomUsers';
import { getUserRooms } from '@/services/firebase/getUserRooms';
import { joinUserToRoom } from '@/services/firebase/joinUserToRoom';
import { removeNotificationRoom } from '@/services/firebase/removeNotificationRoom';
import { transferRoomAdmin as persistRoomAdminTransfer } from '@/services/firebase/transferRoomAdmin';
import { updateCategory } from '@/services/firebase/updateCategory';
import { updateRoom, UpdateRoomPatch } from '@/services/firebase/updateRoom';
import { useUserStore } from '@/store/userStore';
import { CategoryType } from '@/types/category';
import { OutboxOperation } from '@/types/outbox';
import { PermissionRoom, RoomType } from '@/types/room';
import { SyncStatus, TransactionProps } from '@/types/transaction';
import { UserWithRoleRoom } from '@/types/user';
import { canInRoom } from '@/utils/canInRoom';
import { convertToDate } from '@/utils/convertToDate';

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
  transferRoomAdmin: (targetUserId: string) => Promise<void>;
  removeNotification: (userId: string) => Promise<void>;
  updateRoomMeta: (patch: UpdateRoomPatch) => Promise<void>;
  ensureRoomKind: (room: RoomType) => Promise<RoomType>;
  hydrateTransactionsFromQueue: () => Promise<void>;
  markTransactionsSynced: (transactionIds: string[]) => void;
};

const updateRoomTransactionsSyncStatus = (
  targetRoom: RoomType | null,
  syncedSet: Set<string>
): RoomType | null => {
  if (!targetRoom?.transactions?.length) {
    return targetRoom;
  }

  const hasUpdates = targetRoom.transactions.some(
    (tx) => syncedSet.has(tx.transactionId) && tx.syncStatus !== SyncStatus.SYNCED
  );

  if (!hasUpdates) {
    return targetRoom;
  }

  return {
    ...targetRoom,
    transactions: targetRoom.transactions.map((tx) =>
      syncedSet.has(tx.transactionId) ? { ...tx, syncStatus: SyncStatus.SYNCED } : tx
    ),
  };
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

      const projectedTransactions = await transactionRepository.hydrateRoomTransactions(
        roomId,
        transactions
      );

      set((state) => {
        const nextRoom =
          state.room && state.room.roomId === roomId
            ? { ...state.room, transactions: projectedTransactions }
            : state.room;
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

    const optimisticTx: TransactionProps = {
      ...transaction,
      roomId: transaction.roomId || roomId,
      transactionId: id,
      syncStatus: SyncStatus.PENDING,
    };

    set((state) => {
      const nextActiveRoom =
        state.room && state.room.roomId === roomId
          ? {
              ...state.room,
              transactions: [...(state.room.transactions || []), optimisticTx],
            }
          : state.room;

      const nextUserRooms = state.userRooms.map((item) =>
        item.roomId === roomId
          ? {
              ...item,
              transactions: [...(item.transactions || []), optimisticTx],
            }
          : item
      );

      return {
        room: nextActiveRoom,
        userRooms: nextUserRooms,
      };
    });

    await transactionRepository.enqueueCreate(roomId, optimisticTx);
  },

  markTransactionsSynced: (transactionIds) => {
    if (!transactionIds.length) {
      return;
    }

    const syncedSet = new Set(transactionIds);

    set((state) => ({
      room: updateRoomTransactionsSyncStatus(state.room, syncedSet),
      userRooms: state.userRooms.map(
        (item) => updateRoomTransactionsSyncStatus(item, syncedSet) ?? item
      ),
    }));
  },

  hydrateTransactionsFromQueue: async () => {
    try {
      const currentRoom = get().room;

      if (!currentRoom) {
        return;
      }

      const projectedTransactions = await transactionRepository.hydrateRoomTransactions(
        currentRoom.roomId,
        currentRoom.transactions || []
      );

      set((state) => {
        if (!state.room || state.room.roomId !== currentRoom.roomId) {
          return state;
        }

        const nextRoom = {
          ...state.room,
          transactions: projectedTransactions,
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

    const start = period.start.toDate('UTC');
    const end = period.end.toDate('UTC');
    end.setUTCHours(23, 59, 59, 999);

    return (
      room.transactions?.filter((t) => {
        if (t.type !== viewType) return false;

        const rawDate = t.date ?? t.createdAt;

        if (!rawDate) return false;

        const date = convertToDate(rawDate);

        if (Number.isNaN(date.getTime())) return false;

        return date >= start && date <= end;
      }) || []
    );
  },

  updateTransaction: async (data: TransactionProps) => {
    const { room } = get();

    const roomId = data.roomId || room?.roomId;

    if (!roomId) throw new Error('roomId не найден');

    const existingTx = room?.transactions?.find((t) => t.transactionId === data.transactionId);
    const optimisticTx: TransactionProps = {
      ...existingTx,
      ...data,
      roomId,
      syncStatus: SyncStatus.PENDING,
    };

    set((prev) => {
      const nextRoom =
        prev.room && prev.room.roomId === roomId
          ? {
              ...prev.room,
              transactions:
                prev.room.transactions?.map((t) =>
                  t.transactionId === optimisticTx.transactionId ? optimisticTx : t
                ) || [],
            }
          : prev.room;

      const nextUserRooms = prev.userRooms.map((item) =>
        item.roomId === roomId
          ? {
              ...item,
              transactions:
                item.transactions?.map((t) =>
                  t.transactionId === optimisticTx.transactionId ? optimisticTx : t
                ) || [],
            }
          : item
      );

      return {
        room: nextRoom,
        userRooms: nextUserRooms,
      };
    });

    await transactionRepository.enqueueUpdate(roomId, optimisticTx);
  },

  deleteTransaction: async (transactionId: string) => {
    const { room } = get();

    const roomId = room?.roomId;

    if (!roomId) throw new Error('roomId не найден');

    set((prev) => {
      const nextRoom =
        prev.room && prev.room.roomId === roomId
          ? {
              ...prev.room,
              transactions: prev.room.transactions?.filter(
                (t) => t.transactionId !== transactionId
              ),
            }
          : prev.room;

      const nextUserRooms = prev.userRooms.map((item) =>
        item.roomId === roomId
          ? {
              ...item,
              transactions: item.transactions?.filter((t) => t.transactionId !== transactionId),
            }
          : item
      );

      return {
        room: nextRoom,
        userRooms: nextUserRooms,
      };
    });

    await transactionRepository.enqueueDelete(roomId, transactionId);
  },

  updateRoomMeta: async (patch) => {
    const { room } = get();

    if (!room) {
      throw new Error('Комната не найдена');
    }

    const userId = useUserStore.getState().user?.id;
    const role = userId ? room.members?.[userId]?.role : undefined;
    if (!canInRoom(role, PermissionRoom.ROOM_UPDATE)) {
      notificationManager.add({ title: 'Недостаточно прав', type: 'error' }, { timeout: 1500 });
      throw new Error('Недостаточно прав');
    }

    if (patch.kind) {
      const membersCount = Object.keys(room.members ?? {}).length;
      if (!canSwitchRoomKind(resolveRoomKind(room), patch.kind, membersCount)) {
        notificationManager.add(
          { title: ROOM_KIND_SWITCH_BLOCKED_MESSAGE, type: 'error' },
          { timeout: 2000 }
        );
        throw new Error(ROOM_KIND_SWITCH_BLOCKED_MESSAGE);
      }
    }

    if (patch.name !== undefined && patch.name.trim().length < 3) {
      throw new Error('Минимум 3 символа');
    }

    const previousRoom = room;
    const nextRoom = { ...room, ...patch };

    set((state) => ({
      room: nextRoom,
      userRooms: syncRoomInList(state.userRooms, nextRoom),
    }));

    try {
      const savedPatch = await updateRoom(room.roomId, patch);
      const savedRoom = { ...nextRoom, ...savedPatch };

      set((state) => ({
        room:
          state.room?.roomId === savedRoom.roomId ? { ...state.room, ...savedPatch } : state.room,
        userRooms: syncRoomInList(state.userRooms, savedRoom),
      }));
    } catch (error) {
      set((state) => ({
        room: previousRoom,
        userRooms: syncRoomInList(state.userRooms, previousRoom),
      }));
      const message = error instanceof Error ? error.message : 'Не удалось сохранить комнату';
      notificationManager.add({ title: message, type: 'error' }, { timeout: 1500 });
      throw error;
    }
  },

  ensureRoomKind: async (room) => {
    const nextRoom = await persistMissingRoomKind(room);

    set((state) => ({
      room:
        state.room?.roomId === nextRoom.roomId
          ? { ...state.room, kind: nextRoom.kind }
          : state.room,
      userRooms: syncRoomInList(state.userRooms, nextRoom),
    }));

    return nextRoom;
  },

  addUserToRoom: async (userId) => {
    const { room } = get();

    if (!room) throw new Error('Комната не найдена');

    const joinLimitError = getRoomJoinLimitError(room);
    if (joinLimitError) {
      notificationManager.add({ title: joinLimitError, type: 'error' }, { timeout: 1500 });
      return;
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

  transferRoomAdmin: async (targetUserId) => {
    const { room, members } = get();
    const callerId = useUserStore.getState().user?.id;

    if (!room) {
      throw new Error('Комната не найдена');
    }

    if (!callerId || room.members?.[callerId]?.role !== RoomUserRole.ADMIN) {
      notificationManager.add({ title: 'Недостаточно прав', type: 'error' }, { timeout: 1500 });
      throw new Error('Недостаточно прав');
    }

    let nextMemberMap: RoomType['members'];

    try {
      nextMemberMap = applyRoomAdminTransfer(room.members, callerId, targetUserId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось передать права';
      notificationManager.add({ title: message, type: 'error' }, { timeout: 1500 });
      throw error;
    }

    const previousRoom = room;
    const previousMembers = members;
    const nextRoom = { ...room, members: nextMemberMap };
    const nextMembers = members.map((member) => {
      if (member.id === callerId) {
        return { ...member, role: RoomUserRole.USER };
      }

      if (member.id === targetUserId) {
        return { ...member, role: RoomUserRole.ADMIN };
      }

      return member;
    });

    set((state) => ({
      room: state.room?.roomId === room.roomId ? nextRoom : state.room,
      members: state.room?.roomId === room.roomId ? nextMembers : state.members,
      userRooms: syncRoomInList(state.userRooms, nextRoom),
    }));

    try {
      await persistRoomAdminTransfer(room.roomId, callerId, targetUserId);
      notificationManager.add(
        { title: 'Права администратора переданы', type: 'ok' },
        { timeout: 1500 }
      );
    } catch (error) {
      set((state) => ({
        room: state.room?.roomId === room.roomId ? previousRoom : state.room,
        members: state.room?.roomId === room.roomId ? previousMembers : state.members,
        userRooms: syncRoomInList(state.userRooms, previousRoom),
      }));
      const message = error instanceof Error ? error.message : 'Не удалось передать права';
      notificationManager.add({ title: message, type: 'error' }, { timeout: 1500 });
      throw error;
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

transactionRepository.subscribeSynced((entry) => {
  if (entry.op !== OutboxOperation.DELETE) {
    useRoomStore.getState().markTransactionsSynced([entry.transactionId]);
  }
});
