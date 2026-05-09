import { TransactionProps } from '@/types/transaction';

import { convertToDate } from './convertToDate';

export const getSortedTransactionsByDate = (transactions: TransactionProps[]) => {
  return [...transactions].sort((a, b) => {
    const aDate = a.date?.seconds
      ? convertToDate(a.date).getTime()
      : a.createdAt?.seconds
        ? convertToDate(a.createdAt).getTime()
        : 0;

    const bDate = b.date?.seconds
      ? convertToDate(b.date).getTime()
      : b.createdAt?.seconds
        ? convertToDate(b.createdAt).getTime()
        : 0;

    return aDate - bDate;
  });
};
