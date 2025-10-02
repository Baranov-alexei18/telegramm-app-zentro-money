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
  getTransactionsByType: (type: TransitionEnum) => TransitionType[];
  getCategoriesByType: (type: TransitionEnum) => CategoryType[];
  addNewTransaction: (transaction: TransitionType) => void;
  updateTransactionById: (id: string, updatedFields: Partial<TransitionType>) => void;
  deleteTransactionById: (id: string) => void;
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
  getTransactionsByType: (type) => {
    const { user } = get();
    if (!user || !user?.transitions) {
      return [];
    }
    return user.transitions.filter((transaction: TransitionType) => transaction.type === type);
  },

  addNewTransaction: (transition: TransitionType) => {
    const { user } = get();

    if (!user) {
      return;
    }

    set({
      user: {
        ...user,
        transitions: [...user.transitions, transition],
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

  updateTransactionById: (id: string, updatedFields: Partial<TransitionType>) => {
    const { user } = get();
    if (!user) return;

    const updatedTransitions = user.transitions.map((transition) =>
      transition.id === id ? { ...transition, ...updatedFields } : transition
    );

    const updatedGoals = updatedFields.goal
      ? user.goals.map((goal) =>
          goal.id === updatedFields.goal?.id
            ? {
                ...goal,
                transitions: goal.transitions?.map((t) =>
                  t.id === id ? { ...t, ...updatedFields } : t
                ),
              }
            : goal
        )
      : user.goals;

    set({
      user: {
        ...user,
        transitions: updatedTransitions,
        goals: updatedGoals,
      },
    });
  },

  deleteTransactionById: (id: string) => {
    const { user } = get();
    if (!user) return;

    const updatedTransitions = user.transitions.filter((transition) => transition.id !== id);

    const updatedGoals = user.goals.map((goal) => ({
      ...goal,
      transitions: goal.transitions?.filter((t) => t.id !== id),
    }));

    set({
      user: {
        ...user,
        transitions: updatedTransitions,
        goals: updatedGoals,
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
