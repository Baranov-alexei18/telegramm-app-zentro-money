import { describe, expect, it } from 'vitest';

import { TRANSACTION_TYPE } from '@/constants/transaction-type';
import { TransactionProps } from '@/types/transaction';

import { calculateBalance } from './calculate-balance';

describe('calculateBalance', () => {
  it('должен возвращать 0, если массив пустой', () => {
    const transitions: TransactionProps[] = [];
    expect(calculateBalance(transitions)).toBe(0);
  });

  it('должен корректно считать сумму для доходов', () => {
    const transitions: Partial<TransactionProps>[] = [
      { type: TRANSACTION_TYPE.INCOME, amount: 100 },
      { type: TRANSACTION_TYPE.INCOME, amount: 50 },
    ];
    expect(calculateBalance(transitions as TransactionProps[])).toBe(150);
  });

  it('должен корректно считать сумму для расходов', () => {
    const transitions: Partial<TransactionProps>[] = [
      { type: TRANSACTION_TYPE.EXPENSE, amount: 40 },
      { type: TRANSACTION_TYPE.EXPENSE, amount: 10 },
    ];
    expect(calculateBalance(transitions as TransactionProps[])).toBe(-50);
  });

  it('должен корректно считать итоговую сумму при смешанных типах', () => {
    const transitions: Partial<TransactionProps>[] = [
      { type: TRANSACTION_TYPE.INCOME, amount: 200 },
      { type: TRANSACTION_TYPE.EXPENSE, amount: 80 },
      { type: TRANSACTION_TYPE.INCOME, amount: 30 },
      { type: TRANSACTION_TYPE.EXPENSE, amount: 50 },
    ];
    expect(calculateBalance(transitions as TransactionProps[])).toBe(100);
  });

  it('должен игнорировать элементы с неизвестным типом', () => {
    const transitions = [
      { type: 'OTHER', amount: 100 },
      { type: TRANSACTION_TYPE.INCOME, amount: 50 },
    ] as TransactionProps[];
    expect(calculateBalance(transitions)).toBe(50);
  });
});
