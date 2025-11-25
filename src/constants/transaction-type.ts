export enum TRANSACTION_TYPE {
  EXPENSE = 'expense',
  INCOME = 'income',
}

export const TABS_TYPES = [
  { key: TRANSACTION_TYPE.EXPENSE, label: 'Расходы' },
  { key: TRANSACTION_TYPE.INCOME, label: 'Доходы' },
];
