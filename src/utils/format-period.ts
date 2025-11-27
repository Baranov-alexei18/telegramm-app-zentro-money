import { CalendarDate, endOfWeek, startOfWeek } from '@internationalized/date';

import { GranularityFields } from '@/constants/granularity';

const format = (date: Date, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('ru-RU', options).format(date);

export const formatPeriod = (period: CalendarDate, type: GranularityFields) => {
  if (type === GranularityFields.DAY) {
    return format(period.toDate('UTC'), {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  if (type === GranularityFields.WEEK) {
    const start = startOfWeek(period, 'ru');
    const end = endOfWeek(period, 'ru');

    const startDate = start.toDate('UTC');
    const endDate = end.toDate('UTC');

    if (start.month === end.month) {
      return `${start.day}–${end.day}.${format(startDate, {
        month: 'numeric',
        year: 'numeric',
      })}`;
    }

    return `${format(startDate, { day: 'numeric', month: 'numeric' })} – ${format(endDate, {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    })}`;
  }

  if (type === GranularityFields.MONTH) {
    return format(period.toDate('UTC'), {
      month: 'long',
      year: 'numeric',
    });
  }

  if (type === GranularityFields.YEAR) {
    return format(period.toDate('UTC'), { year: 'numeric' });
  }

  return '';
};
