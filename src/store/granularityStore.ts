import { CalendarDate, today } from '@internationalized/date';
import { create } from 'zustand';

import { GranularityFields } from '@/constants/granularity';

type Store = {
  type: GranularityFields;
  period: { start: CalendarDate; end: CalendarDate };
  setGranularityType: (data: Store['type']) => void;
  setGranularityPeriod: (data: Store['period']) => void;
};

const now = today('UTC');
const startOfMonth = new CalendarDate(now.year, now.month, 1);
const daysInMonth = now.calendar.getDaysInMonth(now);
const endOfMonth = new CalendarDate(now.year, now.month, daysInMonth);

export const useGranularityStore = create<Store>()((set) => ({
  type: GranularityFields.MONTH,
  period: {
    start: startOfMonth,
    end: endOfMonth,
  },
  setGranularityType: (data) => set({ type: data }),
  setGranularityPeriod: (data) => set({ period: data }),
}));
