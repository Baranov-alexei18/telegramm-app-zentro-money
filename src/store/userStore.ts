import { create } from 'zustand';

import { CategoryType } from '@/types/category';
import { GoalType } from '@/types/goal';
import { TransitionEnum, TransitionType } from '@/types/transition';
import { UserType } from '@/types/user';

type Props = {
  user: UserType | null;
  loading: boolean;
  error: Error | null;
  setUser: (user: UserType | null) => any;
  // getTransactionsByType: (type: TransitionEnum) => TransitionType[];
  getCategoriesByType: (type: TransitionEnum) => CategoryType[];
  addNewTransaction: (transaction: TransitionType) => void;
  addNewCategory: (category: CategoryType) => void;
  updateCategoryById: (id: string, updatedFields: Partial<CategoryType>) => void;
  deleteCategoryById: (id: string) => void;
  addNewGoal: (goal: GoalType) => void;
};

export const useUserStore = create<Props>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  setUser: (user: UserType | null) => set({ user }),

  // user transitions

  addNewTransaction: (transition: TransitionType) => {
    const { user } = get();

    if (!user) {
      return;
    }

    set({
      user: {
        ...user,
        goals: transition.goal
          ? user.goals.map((goal) =>
              goal.id === transition.goal?.id
                ? { ...goal, transitions: [...(goal.transitions || []), transition] }
                : goal
            )
          : user.goals,
      },
    });
  },

  // user categories
  getCategoriesByType: (type) => {
    const { user } = get();
    if (!user || !user?.categories) {
      return [];
    }
    return user.categories.filter((category: CategoryType) => category.type === type);
  },
  addNewCategory: (category: CategoryType) => {
    const { user } = get();

    if (!user) {
      return;
    }

    set({ user: { ...user, categories: [...user.categories, category] } });
  },

  updateCategoryById: (id: string, updatedFields: Partial<CategoryType>) => {
    const { user } = get();

    if (!user) {
      return;
    }

    const updatedCategories = user.categories.map((category) =>
      category.id === id ? { ...category, ...updatedFields } : category
    );

    set({ user: { ...user, categories: updatedCategories } });
  },

  deleteCategoryById: (id: string) => {
    const { user } = get();

    if (!user) {
      return;
    }

    const updatedCategories = user.categories.filter((category) => category.id !== id);

    set({ user: { ...user, categories: updatedCategories } });
  },

  // user goals
  addNewGoal: (goal: GoalType) => {
    const { user } = get();

    if (!user) {
      return;
    }

    set({ user: { ...user, goals: [...user.goals, goal] } });
  },
}));
