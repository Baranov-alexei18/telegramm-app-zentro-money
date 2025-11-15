import {
  CalendarDate,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from '@internationalized/date';

import { GranularityFields } from '@/constants/granularity';

export const recalcPeriod = (date: CalendarDate, type: GranularityFields) => {
  switch (type) {
    case GranularityFields.DAY:
      return { start: date, end: date };
    case GranularityFields.WEEK:
      return { start: startOfWeek(date, 'UTC', 'mon'), end: endOfWeek(date, 'UTC', 'mon') };
    case GranularityFields.YEAR:
      return {
        start: new CalendarDate(date.year, 1, 1),
        end: new CalendarDate(date.year, 12, 31),
      };
    default:
      return { start: startOfMonth(date), end: endOfMonth(date) };
  }
};
