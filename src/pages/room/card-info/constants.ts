import { TRANSACTION_TYPE } from '@/constants/transaction-type';

export const CardInfoMapper: Record<
  TRANSACTION_TYPE,
  {
    title: string;
    bottomButtonTitle: string;
  }
> = {
  [TRANSACTION_TYPE.EXPENSE]: {
    title: 'Расход',
    bottomButtonTitle: 'Все расходы',
  },
  [TRANSACTION_TYPE.INCOME]: {
    title: 'Доход',
    bottomButtonTitle: 'Все доходы',
  },
};
