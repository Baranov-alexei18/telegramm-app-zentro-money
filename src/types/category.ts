import { TRANSACTION_TYPE } from '@/constants/transaction-type';

export type CategoryType = {
  id: string;
  type: TRANSACTION_TYPE;
  name: string;
  color: string;
};
