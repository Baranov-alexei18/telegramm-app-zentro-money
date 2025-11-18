import { create } from 'zustand';

import { notificationManager } from '@/components/shared/toast/utils';
import { updateUser } from '@/services/firebase/updateUser';
import { UpdateUserType, UserType } from '@/types/user';

type Props = {
  user: UserType | null;
  loading: boolean;
  error: Error | null;
  setUser: (user: UserType | null) => void;
  setLoading: (data: boolean) => void;
  updateDataUser: (data: UpdateUserType) => void;
};

export const useUserStore = create<Props>((set, get) => ({
  //DONT SAVE

  // user: {
  //   email: 'test@mail.ru',
  //   id: 'pghQMDZNj3XRo5cXFbuuEouv2W62',
  //   firstName: '',
  //   lastName: '',
  //   rooms: [],
  //   username: 'test',
  //   telegramId: null,
  // },
  user: null,
  loading: true,
  error: null,
  setUser: (user: UserType | null) => set({ user }),
  setLoading: (data: boolean) => set({ loading: data }),
  updateDataUser: async (data: UpdateUserType) => {
    const { user } = get();

    if (!user) {
      set({ error: new Error('Пользователь не найден') });
      return;
    }

    try {
      await updateUser(user.id, data);

      set({
        user: {
          ...user,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        },
      });

      notificationManager.add(
        {
          title: 'Данные обновлены',
          type: 'ok',
        },
        { timeout: 1500 }
      );
    } catch (error: any) {
      notificationManager.add(
        {
          title: error.message || 'Ошибка при обновлении данных',
          type: 'error',
        },
        { timeout: 1500 }
      );
    }
  },
}));
