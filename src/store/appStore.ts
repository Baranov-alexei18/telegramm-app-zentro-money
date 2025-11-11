import { create } from 'zustand';

type BottomSheet = {
  id: string;
};

type Props = {
  bottomSheets: BottomSheet[];
  openBottomSheet: (id: string) => void;
  closeTopBottomSheet: () => void;
  isTopSheet: (id: string) => boolean;
};

export const useAppStore = create<Props>((set, get) => ({
  bottomSheets: [],

  openBottomSheet: (id) =>
    set((state) => ({
      bottomSheets: [...state.bottomSheets, { id }],
    })),

  closeTopBottomSheet: () =>
    set((state) => ({
      bottomSheets: state.bottomSheets.slice(0, -1),
    })),

  isTopSheet: (id) => {
    const ids = get().bottomSheets;
    return ids[ids.length - 1]?.id === id;
  },
}));
