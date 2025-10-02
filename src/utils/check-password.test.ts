import * as bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { checkPassword } from './check-password';

vi.mock('bcryptjs');

describe('checkPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен вернуть true, если пароли совпадают', async () => {
    vi.mocked(bcrypt.compare).mockImplementationOnce(() => Promise.resolve(true as boolean));

    const result = await checkPassword('plainPassword123', 'hashedPassword');
    expect(result).toBe(true);
    expect(bcrypt.compare).toHaveBeenCalledWith('plainPassword123', 'hashedPassword');
  });

  it('должен выбросить ошибку, если пароли не совпадают', async () => {
    vi.mocked(bcrypt.compare).mockImplementationOnce(() => Promise.resolve(false as boolean));

    await expect(checkPassword('wrongPassword', 'hashedPassword')).rejects.toThrowError(
      'Неверный пароль'
    );

    expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', 'hashedPassword');
  });
});
