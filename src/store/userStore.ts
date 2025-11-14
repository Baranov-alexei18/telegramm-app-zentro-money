import { create } from 'zustand';

import { UserType } from '@/types/user';

type Props = {
  user: UserType | null;
  loading: boolean;
  error: Error | null;
  setUser: (user: UserType | null) => void;
  setLoading: (data: boolean) => void;
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
  loading: true,
  error: null,
  setUser: (user: UserType | null) => set({ user }),
  setLoading: (data: boolean) => set({ loading: data }),
}));
