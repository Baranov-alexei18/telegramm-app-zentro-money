import { CategoryType } from './category';
import { GoalType } from './goal';
import { UserType } from './user';

export enum TransitionEnum {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
}

export type TransitionType = {
  id: string;
  amount: number;
  date: Date;
  note?: string;
  type: TransitionEnum.EXPENSE | TransitionEnum.INCOME;
  goal?: GoalType;
  authUser?: UserType;
  category?: CategoryType;
};
