import { collection, getDocs } from 'firebase/firestore';
import { create } from 'zustand';

import { COLLECTION_ROOM, SUB_COLLECTION_TRANSACTIONS } from '@/constants/db';
import { db } from '@/services/firebase/config';
import { createTransaction } from '@/services/firebase/createTransaction';
import { RoomType } from '@/types/room';
import { TransactionProps } from '@/types/transaction';

type RoomStoreState = {
  room: RoomType | null;
  isLoading: boolean;
  error: string | null;
  setRoom: (room: RoomType | null) => void;
  clearRoom: () => void;
  addTransaction: (
    roomId: string,
    transaction: Omit<TransactionProps, 'transactionId'>
  ) => Promise<void>;
  fetchTransactions: (roomId: string) => Promise<void>;
};

export const useRoomStore = create<RoomStoreState>((set, get) => ({
  room: null,
  isLoading: false,
  error: null,

  setRoom: (room) => set({ room }),
  clearRoom: () => set({ room: null, error: null }),

  fetchTransactions: async (roomId) => {
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
}));
