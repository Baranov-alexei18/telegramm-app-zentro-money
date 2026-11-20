import { describe, expect, it } from 'vitest';

import { UserType } from '@/types/user';

import { getUserGreetingName } from './get-user-greeting-name';

describe('getUserGreetingName', () => {
  it('должен возвращать null, если пользователь не передан', () => {
    expect(getUserGreetingName(null)).toBeNull();
    expect(getUserGreetingName(undefined)).toBeNull();
  });

  it('должен отдавать приоритет firstName, если оно заполнено', () => {
    const user: UserType = {
      id: '1',
      firstName: '  Алексей  ',
      username: 'alexei_dev',
      email: 'test@mail.ru',
      telegramId: null,
    };

    expect(getUserGreetingName(user)).toBe('Алексей');
  });

  it('должен возвращать username, если firstName пустое', () => {
    const user: UserType = {
      id: '2',
      firstName: '   ',
      username: 'zentro_user',
      email: 'test@mail.ru',
      telegramId: null,
    };

    expect(getUserGreetingName(user)).toBe('zentro_user');
  });

  it('должен возвращать часть email до @, если нет firstName и username', () => {
    const user: UserType = {
      id: '3',
      email: 'ivan.petrov@example.com',
      telegramId: null,
    };

    expect(getUserGreetingName(user)).toBe('ivan.petrov');
  });

  it('должен возвращать null, если все поля имени пустые', () => {
    const user: UserType = {
      id: '4',
      firstName: '',
      username: '',
      email: '',
      telegramId: null,
    };

    expect(getUserGreetingName(user)).toBeNull();
  });
});
