import { TransactionProps } from './transaction';
import { UserType } from './user';

export type GoalType = {
  id?: string;
  title: string;
  description: string;
  target_amount: number;
  start_date: Date;
  end_date: Date;
  authUser?: UserType;
  transitions?: TransactionProps[];
};
