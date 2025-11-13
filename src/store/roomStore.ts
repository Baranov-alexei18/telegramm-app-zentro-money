import { collection, getDocs } from 'firebase/firestore';
import { create } from 'zustand';

import { notificationManager } from '@/components/shared/toast/utils';
import { COLLECTION_ROOM, SUB_COLLECTION_TRANSACTIONS } from '@/constants/db';
import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { db } from '@/services/firebase/config';
import { createCategory } from '@/services/firebase/createCategory';
import { createTransaction } from '@/services/firebase/createTransaction';
import { deleteCategoryById } from '@/services/firebase/deleteCategoryById';
import { deleteTransactionById } from '@/services/firebase/deleteTransactionById';
import { joinUserToRoom } from '@/services/firebase/joinUserToRoom';
import { removeNotificationRoom } from '@/services/firebase/removeNotificationRoom';
import { updateCategory } from '@/services/firebase/updateCategory';
import { updateTransaction } from '@/services/firebase/updateTransaction';
import { CategoryType } from '@/types/category';
import { RoomType } from '@/types/room';
import { TransactionProps } from '@/types/transaction';

type RoomStoreState = {
  room: RoomType | null;
  isLoading: boolean;
  error: string | null;
  setRoom: (room: RoomType | null) => void;
  clearRoom: () => void;
  fetchTransactions: (roomId: string) => Promise<void>;
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
  removeNotification: (userId: string) => Promise<void>;
};

export const useRoomStore = create<RoomStoreState>((set, get) => ({
  room: null,
  isLoading: false,
  error: null,

  setRoom: (room) => set({ room }),
  clearRoom: () => set({ room: null, error: null }),

  fetchTransactions: async (roomId: string) => {
    try {
      const transactionsSnap = await getDocs(
        collection(db, COLLECTION_ROOM, roomId, SUB_COLLECTION_TRANSACTIONS)
      );
      const transactions: TransactionProps[] = transactionsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as unknown as TransactionProps[];

      set((state) => ({
        room: state.room ? { ...state.room, transactions } : state.room,
      }));
    } catch (err: any) {
      console.error('Ошибка при получении транзакций:', err);
    }
  },

  addTransaction: async (roomId, transaction) => {
    try {
      const id = await createTransaction(roomId, transaction);

      set((state) => ({
        room: state.room
          ? {
              ...state.room,
              transactions: [
                ...(state.room.transactions || []),
                { ...transaction, transactionId: id },
              ],
            }
          : state.room,
      }));
    } catch (err: any) {
      console.error('Ошибка при добавлении транзакции:', err);
    }
  },

  addCategory: async (category: { name: string; type: TRANSACTION_TYPE }) => {
    const roomId = get().room?.roomId;

    if (!roomId) throw new Error('roomId не найден');

    try {
      const data = await createCategory(roomId, category);

      set((state) => ({
        room: state.room
          ? { ...state.room, categories: [...state.room.categories, data] }
          : state.room,
      }));
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

      set((prev) => ({
        room: prev.room ? { ...prev.room, categories: categories } : prev.room,
      }));
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

      set((prev) => ({
        room: prev.room ? { ...prev.room, categories: categories } : prev.room,
      }));
    } catch (err: any) {
      console.error('Ошибка при удалении категории:', err);
    }
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

    try {
      const data = await joinUserToRoom(userId, room);

      set({
        room: {
          ...room,
          members: data?.members || room.members,
          notifications: data?.notifications,
        },
      });

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

  removeNotification: async (userId) => {
    const { room } = get();
    if (!room) throw new Error('Комната не найдена');

    try {
      const notifications = await removeNotificationRoom(userId, room);

      set({
        room: { ...room, notifications: notifications },
      });
    } catch (err: any) {
      console.error('Ошибка при удалении уведомления:', err);
    }
  },
}));
