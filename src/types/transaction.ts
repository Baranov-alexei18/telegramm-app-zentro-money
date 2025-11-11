import { TRANSACTION_TYPE } from '@/constants/transaction-type';

import { CategoryType } from './category';

export type TransactionFormValues = {
  date: Date &
    Partial<{
      seconds: number;
      nanoseconds: number;
    }>;
  category: CategoryType;
  amount: number;
  description: string;
};

export type TransactionProps = TransactionFormValues & {
  type: TRANSACTION_TYPE;
  userId: string;
  roomId: string;
  createdAt?: Date;
  transactionId: string;
};
