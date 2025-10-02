import { TransitionType } from './transition';
import { UserType } from './user';

export type GoalType = {
  id?: string;
  title: string;
  description: string;
  target_amount: number;
  start_date: Date;
  end_date: Date;
  authUser?: UserType;
  transitions?: TransitionType[];
};
