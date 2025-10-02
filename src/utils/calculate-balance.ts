import { TransitionEnum, TransitionType } from '@/types/transition';

export const calculateBalance = (transitions: TransitionType[]) => {
  return transitions.reduce((acc, curr) => {
    if (curr.type === TransitionEnum.INCOME) {
      return acc + curr.amount;
    } else if (curr.type === TransitionEnum.EXPENSE) {
      return acc - curr.amount;
    }
    return acc;
  }, 0);
};
