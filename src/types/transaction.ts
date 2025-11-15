import { Timestamp } from 'firebase/firestore';

import { TRANSACTION_TYPE } from '@/constants/transaction-type';

import { CategoryType } from './category';

export type TransactionFormValues = {
  date: Timestamp;
  category: CategoryType;
  amount: number;
  description: string;
};

export type TransactionProps = TransactionFormValues & {
  type: TRANSACTION_TYPE;
  userId: string;
  roomId: string;
  createdAt?: Timestamp;
  transactionId: string;
};
