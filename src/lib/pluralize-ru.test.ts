import { describe, expect, it } from 'vitest';

import { PluralFormsType, pluralizeRu } from './pluralize-ru';

const FORMS: PluralFormsType = ['участник', 'участника', 'участников'];

describe('pluralizeRu', () => {
  it('должен возвращать форму единственного числа для 1 и чисел, оканчивающихся на 1 (кроме 11)', () => {
    expect(pluralizeRu(1, FORMS)).toBe('участник');
    expect(pluralizeRu(21, FORMS)).toBe('участник');
    expect(pluralizeRu(101, FORMS)).toBe('участник');
  });

  it('должен возвращать форму для 2–4 и чисел, оканчивающихся на 2–4 (кроме 12–14)', () => {
    expect(pluralizeRu(2, FORMS)).toBe('участника');
    expect(pluralizeRu(3, FORMS)).toBe('участника');
    expect(pluralizeRu(4, FORMS)).toBe('участника');
    expect(pluralizeRu(22, FORMS)).toBe('участника');
    expect(pluralizeRu(34, FORMS)).toBe('участника');
  });

  it('должен возвращать форму множественного числа для 0, 5–20 и круглых десятков', () => {
    expect(pluralizeRu(0, FORMS)).toBe('участников');
    expect(pluralizeRu(5, FORMS)).toBe('участников');
    expect(pluralizeRu(10, FORMS)).toBe('участников');
    expect(pluralizeRu(11, FORMS)).toBe('участников');
    expect(pluralizeRu(12, FORMS)).toBe('участников');
    expect(pluralizeRu(14, FORMS)).toBe('участников');
    expect(pluralizeRu(19, FORMS)).toBe('участников');
    expect(pluralizeRu(25, FORMS)).toBe('участников');
    expect(pluralizeRu(111, FORMS)).toBe('участников');
  });

  it('должен корректно обрабатывать отрицательные и дробные числа', () => {
    expect(pluralizeRu(-1, FORMS)).toBe('участник');
    expect(pluralizeRu(-3, FORMS)).toBe('участника');
    expect(pluralizeRu(-12, FORMS)).toBe('участников');
    expect(pluralizeRu(2.9, FORMS)).toBe('участника');
  });
});
