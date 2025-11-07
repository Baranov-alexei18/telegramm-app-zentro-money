import { create } from 'zustand';

import { UserType } from '@/types/user';

type Props = {
  user: UserType | null;
  loading: boolean;
  error: Error | null;
  setUser: (user: UserType | null) => void;
  setLoading: (data: boolean) => void;
  // getTransactionsByType: (type: TransitionEnum) => TransitionType[];
  // getCategoriesByType: (type: TransitionEnum) => CategoryType[];
  // addNewTransaction: (transaction: TransitionType) => void;
  // addNewCategory: (category: CategoryType) => void;
  // updateCategoryById: (id: string, updatedFields: Partial<CategoryType>) => void;
  // deleteCategoryById: (id: string) => void;
  // addNewGoal: (goal: GoalType) => void;
};

export const useUserStore = create<Props>((set, get) => ({
  //DONT SAVE

  user: {
    email: 'test@mail.ru',
    id: 'pghQMDZNj3XRo5cXFbuuEouv2W62',
    firstName: '',
    lastName: '',
    rooms: [],
    username: 'test',
    telegramId: null,
  },
  // user: null,
  loading: false,
  error: null,
  setUser: (user: UserType | null) => set({ user }),
  setLoading: (data: boolean) => set({ loading: data }),
}));
