import { CategoryType } from './category';
import { GoalType } from './goal';

export type UserType = {
  id: string;
  email: string;
  password: string;
  name: string;
  avatar: any;
  categories: CategoryType[];
  goals: GoalType[];
  rooms: any[];
};

export type TelegramUser = {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
};
