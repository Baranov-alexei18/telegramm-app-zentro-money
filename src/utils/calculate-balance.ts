import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { TransactionProps } from '@/types/transaction';

export const calculateBalance = (transitions: TransactionProps[]) => {
  return transitions.reduce((acc, curr) => {
    if (curr.type === TRANSACTION_TYPE.INCOME) {
      return acc + curr.amount;
    } else if (curr.type === TRANSACTION_TYPE.EXPENSE) {
      return acc - curr.amount;
    }
    return acc;
  }, 0);
};
