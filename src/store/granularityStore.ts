import { create } from 'zustand';

import { GRANULARITY } from '@/constants/granularity';

type Store = {
  type: keyof typeof GRANULARITY;
  period: any;
  setGranularityType: (data: Store['type']) => void;
  setGranularityPeriod: (data: Store['period']) => void;
};

export const useGranularityStore = create<Store>()((set) => ({
  type: 'month',
  period: '',
  setGranularityType: (data: Store['type']) => set(() => ({ type: data })),
  setGranularityPeriod: (data: Store['period']) => set(() => ({ period: data })),
}));
