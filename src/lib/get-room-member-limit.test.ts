import { describe, expect, it } from 'vitest';

import { RoomKind } from '@/constants/room-kind';

import { getRoomMemberLimit } from './get-room-member-limit';

describe('getRoomMemberLimit', () => {
  it('должен возвращать 1 для комнаты на одного человека', () => {
    expect(getRoomMemberLimit(RoomKind.SINGLE_PERSON)).toBe(1);
  });

  it('должен возвращать 5 для комнаты с общими тратами', () => {
    expect(getRoomMemberLimit(RoomKind.SHARED_EXPENSES)).toBe(5);
  });
});
