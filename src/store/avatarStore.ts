import { create } from 'zustand';

export const AVATAR_IDS = ['cm9zcuhsvlffr07lrmnm7531v', 'cm9zcuht9lffw07lrrjvexvfz'];

export type AvatarType = {
  id: string;
  url: string;
  fileName: string;
};

type Props = {
  avatars: AvatarType[];
  loading: boolean;
  error: Error | null;
  fetchAvatars: (ids: string[]) => Promise<void>;
};

export const useAvatarStore = create<Props>((set) => ({
  avatars: [],
  loading: false,
  error: null,
  fetchAvatars: async (ids: string[]) => {
    set({ loading: true, error: null });
  },
}));
