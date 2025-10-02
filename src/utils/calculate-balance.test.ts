import { describe, expect, it } from 'vitest';

import { TransitionEnum, TransitionType } from '@/types/transition';

import { calculateBalance } from './calculate-balance';

describe('calculateBalance', () => {
  it('должен возвращать 0, если массив пустой', () => {
    const transitions: TransitionType[] = [];
    expect(calculateBalance(transitions)).toBe(0);
  });

  it('должен корректно считать сумму для доходов', () => {
    const transitions: Partial<TransitionType>[] = [
      { type: TransitionEnum.INCOME, amount: 100 },
      { type: TransitionEnum.INCOME, amount: 50 },
    ];
    expect(calculateBalance(transitions as TransitionType[])).toBe(150);
  });

  it('должен корректно считать сумму для расходов', () => {
    const transitions: Partial<TransitionType>[] = [
      { type: TransitionEnum.EXPENSE, amount: 40 },
      { type: TransitionEnum.EXPENSE, amount: 10 },
    ];
    expect(calculateBalance(transitions as TransitionType[])).toBe(-50);
  });

  it('должен корректно считать итоговую сумму при смешанных типах', () => {
    const transitions: Partial<TransitionType>[] = [
      { type: TransitionEnum.INCOME, amount: 200 },
      { type: TransitionEnum.EXPENSE, amount: 80 },
      { type: TransitionEnum.INCOME, amount: 30 },
      { type: TransitionEnum.EXPENSE, amount: 50 },
    ];
    expect(calculateBalance(transitions as TransitionType[])).toBe(100);
  });

  it('должен игнорировать элементы с неизвестным типом', () => {
    const transitions = [
      { type: 'OTHER', amount: 100 },
      { type: TransitionEnum.INCOME, amount: 50 },
    ] as TransitionType[];
    expect(calculateBalance(transitions)).toBe(50);
  });
});
