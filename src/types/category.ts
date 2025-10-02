import { TransitionEnum } from './transition';
import { UserType } from './user';

export type CategoryType = {
  id: string;
  name: string;
  chartColor: string;
  type: TransitionEnum;
  authUser?: UserType;
};
