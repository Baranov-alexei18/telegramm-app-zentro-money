import { CategoryType } from './category';
import { GoalType } from './goal';
import { TransitionType } from './transition';

export type UserType = {
  id: string;
  email: string;
  password: string;
  name: string;
  avatar: any;
  transitions: TransitionType[];
  categories: CategoryType[];
  goals: GoalType[];
};
