import { describe, expect, it } from 'vitest';

import { getCapitalizeFirstLetter } from './get-capitalize-first-letter';

describe('getCapitalizeFirstLetter', () => {
  it('должен делать первую букву заглавной', () => {
    expect(getCapitalizeFirstLetter('hello')).toBe('Hello');
  });

  it('должен оставить первую букву заглавной, если она уже заглавная', () => {
    expect(getCapitalizeFirstLetter('Hello')).toBe('Hello');
  });

  it('должен корректно работать со строкой из одной буквы', () => {
    expect(getCapitalizeFirstLetter('h')).toBe('H');
  });

  it('должен вернуть пустую строку, если входная строка пустая', () => {
    expect(getCapitalizeFirstLetter('')).toBe('');
  });

  it('должен оставить оставшуюся часть строки без изменений', () => {
    expect(getCapitalizeFirstLetter('hELLO')).toBe('HELLO');
  });
});
