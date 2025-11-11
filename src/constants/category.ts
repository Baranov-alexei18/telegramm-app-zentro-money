import { TRANSACTION_TYPE } from './transaction-type';

export const BASE_CATEGORIES = [
  { id: 'salary', name: 'Зарплата', type: TRANSACTION_TYPE.INCOME, color: '#4CAF50' },
  { id: 'investments', name: 'Инвестиции', type: TRANSACTION_TYPE.INCOME, color: '#9C27B0' },
  { id: 'gifts', name: 'Подарки', type: TRANSACTION_TYPE.INCOME, color: '#FF9800' },
  { id: 'primary', name: 'Премия', type: TRANSACTION_TYPE.INCOME, color: '#009688' },

  { id: 'food', name: 'Еда', type: TRANSACTION_TYPE.EXPENSE, color: '#E91E63' },
  { id: 'transport', name: 'Транспорт', type: TRANSACTION_TYPE.EXPENSE, color: '#3F51B5' },
  { id: 'entertainment', name: 'Развлечения', type: TRANSACTION_TYPE.EXPENSE, color: '#9C27B0' },
  { id: 'shopping', name: 'Покупки', type: TRANSACTION_TYPE.EXPENSE, color: '#FF5722' },
  { id: 'health', name: 'Здоровье', type: TRANSACTION_TYPE.EXPENSE, color: '#F44336' },
  { id: 'education', name: 'Образование', type: TRANSACTION_TYPE.EXPENSE, color: '#795548' },
  { id: 'housing', name: 'Жильё', type: TRANSACTION_TYPE.EXPENSE, color: '#607D8B' },
  {
    id: 'utilities',
    name: 'Коммунальные услуги',
    type: TRANSACTION_TYPE.EXPENSE,
    color: '#00BCD4',
  },
  { id: 'subscriptions', name: 'Подписки', type: TRANSACTION_TYPE.EXPENSE, color: '#673AB7' },
  { id: 'travel', name: 'Путешествия', type: TRANSACTION_TYPE.EXPENSE, color: '#8BC34A' },
  { id: 'sports', name: 'Спорт', type: TRANSACTION_TYPE.EXPENSE, color: '#CDDC39' },
  { id: 'pets', name: 'Домашние животные', type: TRANSACTION_TYPE.EXPENSE, color: '#FFEB3B' },
  {
    id: 'gifts_expense',
    name: 'Подарки (другим)',
    type: TRANSACTION_TYPE.EXPENSE,
    color: '#FF9800',
  },
  { id: 'other', name: 'Прочее', type: TRANSACTION_TYPE.EXPENSE, color: '#9E9E9E' },
];
