import { describe, expect, it } from 'vitest';

import { RoomKind } from '@/constants/room-kind';
import { RoomUserRole } from '@/constants/room-roles';
import { RoomType } from '@/types/room';

import { getRoomJoinLimitError } from './get-room-join-limit-error';

const member = (role: RoomUserRole = RoomUserRole.USER): RoomType['members'][string] => ({
  role,
  joineredAt: new Date('2026-01-01'),
});

describe('getRoomJoinLimitError', () => {
  it('должен возвращать null, если в комнате ещё есть места', () => {
    expect(
      getRoomJoinLimitError({
        kind: RoomKind.SHARED_EXPENSES,
        members: {
          'user-1': member(RoomUserRole.ADMIN),
        },
      })
    ).toBeNull();
  });

  it('должен блокировать вход в комнату для одного человека', () => {
    expect(
      getRoomJoinLimitError({
        kind: RoomKind.SINGLE_PERSON,
        members: {
          'user-1': member(RoomUserRole.ADMIN),
        },
      })
    ).toBe('Эта комната только для одного человека');
  });

  it('должен блокировать вход в заполненную комнату с общими тратами', () => {
    expect(
      getRoomJoinLimitError({
        kind: RoomKind.SHARED_EXPENSES,
        members: {
          'user-1': member(RoomUserRole.ADMIN),
          'user-2': member(),
          'user-3': member(),
          'user-4': member(),
          'user-5': member(),
        },
      })
    ).toBe('В комнате максимальное количество людей — 5');
  });
});
