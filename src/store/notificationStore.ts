import { create } from 'zustand';

export type NotificationType = {
  type: string;
  message: string;
  description: string;
};

type Store = {
  notification: NotificationType | null;
  setNotification: (data: NotificationType) => void;
  removeNotification: () => void;
};

export const useNotificationStore = create<Store>()((set) => ({
  notification: null,
  setNotification: (data: NotificationType) => set(() => ({ notification: data })),
  removeNotification: () => set(() => ({ notification: null })),
}));
