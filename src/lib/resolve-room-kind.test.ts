import { describe, expect, it } from 'vitest';

import { RoomKind } from '@/constants/room-kind';
import { RoomUserRole } from '@/constants/room-roles';

import { deriveRoomKind, hasPersistedRoomKind, resolveRoomKind } from './resolve-room-kind';

describe('resolveRoomKind', () => {
  it('должен считать сохранённые значения kind валидными', () => {
    expect(hasPersistedRoomKind(RoomKind.SHARED_EXPENSES)).toBe(true);
    expect(hasPersistedRoomKind(RoomKind.SINGLE_PERSON)).toBe(true);
    expect(hasPersistedRoomKind(undefined)).toBe(false);
    expect(hasPersistedRoomKind('other')).toBe(false);
  });

  it('должен выводить shared_expenses, если kind не задан, независимо от числа участников', () => {
    expect(deriveRoomKind(0)).toBe(RoomKind.SHARED_EXPENSES);
    expect(deriveRoomKind(1)).toBe(RoomKind.SHARED_EXPENSES);
    expect(deriveRoomKind(2)).toBe(RoomKind.SHARED_EXPENSES);
    expect(deriveRoomKind(5)).toBe(RoomKind.SHARED_EXPENSES);
  });

  it('должен возвращать сохранённый kind, даже если число участников другое', () => {
    const kind = resolveRoomKind({
      kind: RoomKind.SHARED_EXPENSES,
      members: {
        'user-1': { role: RoomUserRole.ADMIN, joineredAt: new Date('2026-01-01') },
      },
    });

    expect(kind).toBe(RoomKind.SHARED_EXPENSES);
  });

  it('должен выводить shared_expenses, если поле kind не задано', () => {
    expect(
      resolveRoomKind({
        members: {
          'user-1': { role: RoomUserRole.ADMIN, joineredAt: new Date('2026-01-01') },
        },
      })
    ).toBe(RoomKind.SHARED_EXPENSES);

    expect(
      resolveRoomKind({
        members: {
          'user-1': { role: RoomUserRole.ADMIN, joineredAt: new Date('2026-01-01') },
          'user-2': { role: RoomUserRole.USER, joineredAt: new Date('2026-01-02') },
        },
      })
    ).toBe(RoomKind.SHARED_EXPENSES);
  });
});
