import { create } from 'zustand';

type Props = {
  bottonSheetOpen: boolean;
  setBottonSheetOpen: (bottonSheetOpen: boolean) => void;
};

export const useAppStore = create<Props>((set, get) => ({
  bottonSheetOpen: false,

  setBottonSheetOpen: (bottonSheetOpen: boolean) => set({ bottonSheetOpen }),
}));
