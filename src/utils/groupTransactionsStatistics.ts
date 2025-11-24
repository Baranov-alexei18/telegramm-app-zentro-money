import { GranularityFields } from '@/constants/granularity';
import { TransactionProps } from '@/types/transaction';

import { convertToDate } from './convertToDate';
import { formatSmartNumber } from './formatSmartNumber';

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const groupTransactionsByPeriod = (
  transactions: TransactionProps[],
  type: GranularityFields
) => {
  const result: Record<string, Record<string, number>> = {};

  if (type === GranularityFields.WEEK) {
    WEEK_DAYS.forEach((day) => (result[day] = {}));

    transactions.forEach((tx) => {
      const date = convertToDate(tx.date);
      const index = (date.getDay() + 6) % 7;
      const day = WEEK_DAYS[index];

      const cat = tx.category.id ?? 'unknown';

      result[day][cat] = Number(formatSmartNumber(result[day][cat] || 0)) + Number(tx.amount);
    });

    return { labels: WEEK_DAYS, result };
  }

  if (type === GranularityFields.MONTH) {
    const maxDays = 31;
    const days = Array.from({ length: maxDays }, (_, i) => `${i + 1}`);

    days.forEach((d) => (result[d] = {}));

    transactions.forEach((tx) => {
      const date = convertToDate(tx.date);
      const day = String(date.getDate());

      const cat = tx.category.id ?? 'unknown';
      result[day][cat] = Number(formatSmartNumber(result[day][cat] || 0)) + Number(tx.amount);
    });

    return { labels: days, result };
  }

  if (type === GranularityFields.YEAR) {
    MONTH_NAMES.forEach((m) => (result[m] = {}));

    transactions.forEach((tx) => {
      const date = convertToDate(tx.date);
      const month = MONTH_NAMES[date.getMonth()];

      const cat = tx.category.id ?? 'unknown';
      result[month][cat] = Number(formatSmartNumber(result[month][cat] || 0)) + Number(tx.amount);
    });

    return { labels: MONTH_NAMES, result };
  }

  return { labels: [], result: {} };
};
