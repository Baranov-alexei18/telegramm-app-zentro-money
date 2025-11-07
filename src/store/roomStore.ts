import { collection, getDocs } from 'firebase/firestore';
import { create } from 'zustand';

import { COLLECTION_ROOM, SUB_COLLECTION_TRANSACTIONS } from '@/constants/db';
import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { db } from '@/services/firebase/config';
import { createCategory } from '@/services/firebase/createCategory';
import { createTransaction } from '@/services/firebase/createTransaction';
import { deleteCategoryById } from '@/services/firebase/deleteCategoryById';
import { updateCategory } from '@/services/firebase/updateCategory';
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
    const roomId = get().room?.id;
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

    const roomId = room?.id;

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

    const roomId = room?.id;

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
}));
