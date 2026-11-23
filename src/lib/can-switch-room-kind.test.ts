import { describe, expect, it } from 'vitest';

import { RoomKind } from '@/constants/room-kind';

import { canSwitchRoomKind } from './can-switch-room-kind';

describe('canSwitchRoomKind', () => {
  it('должен разрешать переход из личного типа в общие траты', () => {
    expect(canSwitchRoomKind(RoomKind.SINGLE_PERSON, RoomKind.SHARED_EXPENSES, 1)).toBe(true);
  });

  it('должен запрещать переход в личный тип, если участников больше одного', () => {
    expect(canSwitchRoomKind(RoomKind.SHARED_EXPENSES, RoomKind.SINGLE_PERSON, 2)).toBe(false);
  });

  it('должен разрешать переход в личный тип, если участник один', () => {
    expect(canSwitchRoomKind(RoomKind.SHARED_EXPENSES, RoomKind.SINGLE_PERSON, 1)).toBe(true);
  });
});
