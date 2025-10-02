import { describe, expect, it } from 'vitest';

import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('должен правильно форматировать дату с однозначным днем и месяцем', () => {
    const date = new Date(2025, 0, 5);
    expect(formatDate(date)).toBe('05.01.2025');
  });

  it('должен правильно форматировать дату с двузначным днем и месяцем', () => {
    const date = new Date(2025, 10, 25);
    expect(formatDate(date)).toBe('25.11.2025');
  });

  it('должен правильно работать для 1 декабря 1999', () => {
    const date = new Date(1999, 11, 1);
    expect(formatDate(date)).toBe('01.12.1999');
  });
});
